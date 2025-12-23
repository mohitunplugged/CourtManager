const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : process.env.RENDER_DISK_PATH
    ? path.join(process.env.RENDER_DISK_PATH, 'courtmanager.db')
    : path.resolve(__dirname, 'courtmanager.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Users Table (Profile + Stats)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    late_penalties INTEGER DEFAULT 0
  )`);

  // 2. Daily Sessions
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    active BOOLEAN DEFAULT 1
  )`);

  // 3. Games History
  db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    game_number INTEGER,
    start_time INTEGER,
    end_time INTEGER,
    is_completed BOOLEAN DEFAULT 0
  )`);

  // 4. Game Players (Many-to-Many)
  // Added is_winner to track results
  db.run(`CREATE TABLE IF NOT EXISTS game_players (
    game_id INTEGER,
    user_id TEXT,
    is_winner BOOLEAN DEFAULT 0,
    FOREIGN KEY(game_id) REFERENCES games(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 5. Audit Logs
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action TEXT,
    details TEXT,
    actor_id TEXT
  )`);
});

// Helper wrapper for Async/Await
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { db, query, run };
