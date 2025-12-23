const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { query, run } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- In-Memory State (The "Live" Session) ---
const FIXED_ROSTER = [
  "Mohit Mahajan", "Ravi Sandhu", "Manoj Jain", "Nikhil Kacker",
  "Gurmeet Singh", "Badal", "Rudra", "DK", "Goyal Sir", "Kulbir Singh"
];

// Helper to get India Date String
function getIndiaDate() {
    return new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' 
    });
}

function getIndiaDayKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

let activeSession = {
  id: uuidv4(), 
  sessionDate: getIndiaDate(),
  actualStartTime: null, // Set when 4th player checks in
  players: [], 
  completedGames: [],
  schedule: [] 
};
let activeSessionDayKey = getIndiaDayKey();

// Configuration
const CONFIG = {
  GAME_DURATION: 12,
  BREAK_DURATION: 4,
  GAMES_BEFORE_BREAK: 3,
  TOTAL_GAMES: 8
};

// --- Helper Functions ---

function clearLiveSessionState() {
  activeSession.actualStartTime = null;
  activeSession.completedGames = [];
  activeSession.schedule = [];
  activeSession.players.forEach(p => {
      p.present = false;
      p.arrivalTime = null;
      p.gamesPlayed = 0;
      p.consecutiveStreak = 0;
      p.restStreak = 0;
      p.latePenalty = 0;
  });
}

async function resetLiveSession(reason) {
  clearLiveSessionState();
  activeSession.id = uuidv4();
  activeSession.sessionDate = getIndiaDate();
  activeSessionDayKey = getIndiaDayKey();

  try {
      await run(`INSERT INTO audit_logs (action, details) VALUES (?, ?)`, ['DAILY_RESET', reason]);
  } catch (err) {
      console.error('DB Save Error (Daily Reset):', err);
  }

  io.emit('state_update', activeSession);
}

function checkForNewDay() {
  const todayKey = getIndiaDayKey();
  if (todayKey !== activeSessionDayKey) {
      void resetLiveSession(`Daily rollover to ${todayKey}`);
  }
}

async function seedUsers() {
  console.log('Seeding fixed roster...');
  for (const name of FIXED_ROSTER) {
    // Check if user exists
    let users = await query(`SELECT * FROM users WHERE name = ?`, [name]);
    let user = users[0];
    
    if (!user) {
      // Create with deterministic ID
      const id = uuidv4(); 
      // Use local custom avatars (Top 1% Design Choice)
      // User must drop 'Mohit.png', 'Ravi.png' etc into client/public/avatars/
      const firstName = name.split(' ')[0];
      const avatar = `/avatars/${firstName}.png`;
      
      await run(`INSERT INTO users (id, name, avatar) VALUES (?, ?, ?)`, [id, name, avatar]);
      user = { id, name, avatar };
    }

    // Add to active session if not present
    if (!activeSession.players.find(p => p.id === user.id)) {
        activeSession.players.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            present: false,
            arrivalTime: null,
            gamesPlayed: 0,
            consecutiveStreak: 0,
            restStreak: 0,
            latePenalty: 0
        });
    }
  }
  
  // Create Session in DB if not exists
  const today = new Date().toISOString().split('T')[0];
  await run(`INSERT INTO sessions (date, active) VALUES (?, 1)`, [today]);

  console.log(`Roster initialized with ${activeSession.players.length} players.`);
}

// Calculate "Games Docked" penalty based on arrival time relative to Actual Start
function calculateLatePenalty(arrivalTime) {
  if (!activeSession.actualStartTime) return 0; // No penalty if session hasn't started
  if (arrivalTime <= activeSession.actualStartTime) return 0; // Arrived before/during start
  
  const diffMinutes = (arrivalTime - activeSession.actualStartTime) / 60000;
  
  const GRACE_PERIOD = 10; 
  const penalty = Math.floor((diffMinutes - GRACE_PERIOD) / CONFIG.GAME_DURATION);
  return Math.max(0, penalty);
}

// The "Brain": Generate Schedule
function recalculateSchedule() {
  const baseTime = activeSession.actualStartTime || Date.now();
  let currentTime = 0; // minutes from baseTime
  let newSchedule = [];

  // 1. Re-add Completed Games
  activeSession.completedGames.forEach(g => {
      newSchedule.push({
          type: 'game',
          id: g.id,
          startTime: currentTime, 
          endTime: currentTime + CONFIG.GAME_DURATION,
          players: g.players,
          winners: g.winners,
          status: 'completed'
      });
      currentTime += CONFIG.GAME_DURATION;
      
      if (g.id > 1 && (g.id) % CONFIG.GAMES_BEFORE_BREAK === 0) {
           newSchedule.push({
              type: 'break',
              startTime: currentTime,
              endTime: currentTime + CONFIG.BREAK_DURATION,
              status: 'completed'
          });
          currentTime += CONFIG.BREAK_DURATION;
      }
  });
  
  // 2. Simulate Future Games
  let simPlayers = JSON.parse(JSON.stringify(activeSession.players));
  const startGameIdx = activeSession.completedGames.length + 1;

  for (let gameIdx = startGameIdx; gameIdx <= CONFIG.TOTAL_GAMES; gameIdx++) {
      // Breaks
      if (gameIdx > 1 && (gameIdx - 1) % CONFIG.GAMES_BEFORE_BREAK === 0) {
          newSchedule.push({
              type: 'break',
              startTime: currentTime,
              endTime: currentTime + CONFIG.BREAK_DURATION
          });
          currentTime += CONFIG.BREAK_DURATION;
      }

      // Filter Present Players
      let availableCandidates = simPlayers.filter(p => p.present);
      
      // Sort
      availableCandidates.sort((a, b) => a.arrivalTime - b.arrivalTime);

      let selectedIds = [];

      if (availableCandidates.length < 4) {
           newSchedule.push({ type: 'game', id: gameIdx, startTime: currentTime, players: [], status: 'waiting' });
      } else if (gameIdx === 1) {
          selectedIds = availableCandidates.slice(0, 4).map(p => p.id);
      } else {
          // Scoring Algorithm
          let candidates = availableCandidates.map(p => {
              let score = 0;
              score += (p.restStreak * 100);
              if (p.latePenalty > 0 && p.gamesPlayed === 0) {
                   score -= 1000 * p.latePenalty; 
              }
              if (p.consecutiveStreak === 1) score += 40; 
              if (p.consecutiveStreak >= 2) score -= 500; 
              score -= (p.gamesPlayed * 5);
              return { id: p.id, score: score };
          });
          candidates.sort((a, b) => b.score - a.score);
          selectedIds = candidates.slice(0, 4).map(c => c.id);
      }

      if (selectedIds.length === 4) {
          newSchedule.push({
              type: 'game',
              id: gameIdx,
              startTime: currentTime,
              endTime: currentTime + CONFIG.GAME_DURATION,
              players: selectedIds,
              status: 'scheduled'
          });

          // Update Sim State
          simPlayers.forEach(p => {
              if (selectedIds.includes(p.id)) {
                  p.gamesPlayed++;
                  p.consecutiveStreak++;
                  p.restStreak = 0;
                  if (p.latePenalty > 0) p.latePenalty--; 
              } else {
                  if (p.present) {
                      p.consecutiveStreak = 0;
                      p.restStreak++;
                  }
              }
          });
      }
      currentTime += CONFIG.GAME_DURATION;
  }
  
  activeSession.schedule = newSchedule;
  io.emit('state_update', activeSession);
}

// --- Socket.IO Events ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  checkForNewDay();
  activeSession.sessionDate = getIndiaDate();
  socket.emit('state_update', activeSession);

  socket.on('login', async ({ id }) => { 
    const player = activeSession.players.find(p => p.id === id);
    if (player) socket.emit('login_success', player);
  });

  socket.on('toggle_status', async ({ userId }) => {
     const player = activeSession.players.find(p => p.id === userId);
     if (player) {
         player.present = !player.present;
         
         if (player.present) {
             player.arrivalTime = Date.now();
             const presentCount = activeSession.players.filter(p => p.present).length;
             if (presentCount === 4 && !activeSession.actualStartTime) {
                 activeSession.actualStartTime = Date.now();
                 await run(`INSERT INTO audit_logs (action, details) VALUES (?, ?)`, 
                    ['SESSION_START', '4th Player arrived. Clock started.']);
             }
             player.latePenalty = calculateLatePenalty(player.arrivalTime);
             await run(`INSERT INTO audit_logs (action, details, actor_id) VALUES (?, ?, ?)`, 
                ['CHECK_IN', `${player.name} checked in. Penalty: ${player.latePenalty}`, userId]);
         } else {
             player.arrivalTime = null;
             player.consecutiveStreak = 0;
             player.restStreak = 0;
             await run(`INSERT INTO audit_logs (action, details, actor_id) VALUES (?, ?, ?)`, 
                ['CHECK_OUT', `${player.name} checked out.`, userId]);
         }
         recalculateSchedule();
     }
  });
  
  // NEW: Handle Game Result
  socket.on('submit_game_result', async ({ gameId, winners }) => { // winners: [id1, id2]
      const gameInSchedule = activeSession.schedule.find(g => g.id === gameId);
      
      if (gameInSchedule && gameInSchedule.status !== 'completed') {
          // 1. Update Live Player Stats Permanently
          const playerIds = gameInSchedule.players;
          
          activeSession.players.forEach(p => {
              if (playerIds.includes(p.id)) {
                  p.gamesPlayed++;
                  p.consecutiveStreak++;
                  p.restStreak = 0;
                  if (p.latePenalty > 0) p.latePenalty--;
              } else {
                  if (p.present) {
                      p.consecutiveStreak = 0;
                      p.restStreak++;
                  }
              }
          });

          // 2. Move to Completed
          const completedGame = {
              ...gameInSchedule,
              status: 'completed',
              winners: winners
          };
          activeSession.completedGames.push(completedGame);
          
          // 3. Persist to DB
          try {
              const result = await run(`INSERT INTO games (session_id, game_number, is_completed) VALUES (?, ?, 1)`, [1, gameId]);
              const dbGameId = result.id;
              
              for (const pid of playerIds) {
                  const isWinner = winners.includes(pid);
                  // Record participation with Winner Flag
                  await run(`INSERT INTO game_players (game_id, user_id, is_winner) VALUES (?, ?, ?)`, [dbGameId, pid, isWinner ? 1 : 0]);
                  
                  // Update User Totals
                  await run(`UPDATE users SET total_games = total_games + 1 WHERE id = ?`, [pid]);
                  if (isWinner) {
                      await run(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [pid]);
                  }
              }

              const winnerNames = activeSession.players.filter(p => winners.includes(p.id)).map(p => p.name).join(', ');
              await run(`INSERT INTO audit_logs (action, details) VALUES (?, ?)`, ['GAME_COMPLETE', `Game ${gameId} won by ${winnerNames}`]);
              
          } catch (err) {
              console.error("DB Save Error:", err);
          }

          // 4. Recalculate Future
          recalculateSchedule();
      }
  });

  socket.on('reset_session', async () => {
      clearLiveSessionState();
      activeSession.sessionDate = getIndiaDate();
      activeSessionDayKey = getIndiaDayKey();
      await run(`INSERT INTO audit_logs (action, details) VALUES (?, ?)`, ['SESSION_RESET', 'Admin reset the session']);
      io.emit('state_update', activeSession);
  });

  socket.on('disconnect', () => {});
});

// --- REST API for History ---
app.get('/api/history', async (req, res) => {
    try {
        const logs = await query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100`);
        res.json({ logs });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- REST API for Stats ---
app.get('/api/stats', async (req, res) => {
    try {
        // Fetch leaderboard
        const users = await query(`SELECT id, name, avatar, total_games, wins, late_penalties FROM users ORDER BY wins DESC, total_games DESC`);
        
        // Calculate Win Rates and formatted stats
        const leaderboard = users.map(u => ({
            ...u,
            winRate: u.total_games > 0 ? Math.round((u.wins / u.total_games) * 100) : 0
        }));

        // Fun Stats calculation
        const mostGames = [...leaderboard].sort((a,b) => b.total_games - a.total_games)[0];
        const mostLate = [...leaderboard].sort((a,b) => b.late_penalties - a.late_penalties)[0];
        const bestRatio = [...leaderboard].filter(u => u.total_games >= 3).sort((a,b) => b.winRate - a.winRate)[0];

        res.json({
            leaderboard,
            highlights: {
                champion: leaderboard[0], // Most wins
                ironMan: mostGames,
                lateComer: mostLate && mostLate.late_penalties > 0 ? mostLate : null,
                sharpshooter: bestRatio
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
seedUsers().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});

setInterval(checkForNewDay, 30 * 1000);
