import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Clock, Trophy, Coffee, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import Avatar from './Avatar';

export default function Timeline() {
  const { sessionState, socket } = useSocket();
  const { schedule, players } = sessionState;
  const [editingGameId, setEditingGameId] = useState(null);
  
  // Local state for the drag-and-drop order: [p1, p2, p3, p4]
  const [orderedPlayers, setOrderedPlayers] = useState([]);

  if (!schedule || schedule.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-3 opacity-50">
              <Clock size={32} />
              <p className="text-sm">Not enough players for a schedule yet.</p>
          </div>
      );
  }

  const handleFinishGame = (gameId, currentPlayers) => {
      setEditingGameId(gameId);
      // Initialize order with current players
      setOrderedPlayers(currentPlayers);
  };

  const submitResult = (gameId, winnerTeamIndex) => {
      // winnerTeamIndex: 0 (Top Team), 1 (Bottom Team)
      const winners = winnerTeamIndex === 0 
          ? [orderedPlayers[0], orderedPlayers[1]]
          : [orderedPlayers[2], orderedPlayers[3]];
      
      socket.emit('submit_game_result', { gameId, winners });
      setEditingGameId(null);
      setOrderedPlayers([]);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Timeline</h2>
      </div>

      <div className="space-y-3 relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

        {schedule.map((item, idx) => {
            if (item.type === 'break') {
                return (
                    <div key={`break-${idx}`} className="flex items-center space-x-4">
                        <div className="w-10 flex flex-col items-center justify-center">
                             <div className="w-2 h-2 rounded-full bg-slate-700 ring-4 ring-slate-900"></div>
                        </div>
                        <div className="flex-1 bg-slate-900/50 border border-dashed border-slate-700 rounded-lg p-3 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest">
                            <Coffee size={14} className="mr-2" />
                            Break (4m)
                        </div>
                    </div>
                );
            }

            const isFull = item.players.length === 4;
            const isCompleted = item.status === 'completed';
            const isEditing = editingGameId === item.id;
            
            return (
                <div key={item.id} className="flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="w-10 pt-4 flex flex-col items-center text-right">
                         <span className="text-[10px] font-mono text-slate-500 mb-1">G{item.id}</span>
                         <div className={`w-3 h-3 rounded-full border-2 ring-4 ring-slate-900 ${isCompleted ? 'bg-slate-700 border-slate-600' : (isFull ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-red-500')}`}></div>
                    </div>

                    <div className={`flex-1 rounded-xl border-l-2 shadow-lg transition-all overflow-hidden
                        ${isCompleted ? 'bg-slate-800/20 border-slate-600 opacity-60' : (isFull ? 'bg-slate-800/40 border-emerald-500' : 'bg-slate-800/20 border-red-500/50 opacity-80')}
                    `}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 border-b border-white/5">
                            <div className="flex items-center">
                                {isCompleted ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded mr-2 bg-slate-700 text-slate-300">COMPLETED</span>
                                ) : (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded mr-2 ${isFull ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {isFull ? 'SCHEDULED' : 'WAITING'}
                                    </span>
                                )}
                            </div>
                            
                            {!isCompleted && isFull && !isEditing && (
                                <button 
                                    onClick={() => handleFinishGame(item.id, item.players)}
                                    className="text-xs flex items-center text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    <Trophy size={14} className="mr-1" />
                                    Record Result
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-3">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-400 text-center">Drag to arrange teams</p>
                                    
                                    <Reorder.Group 
                                        axis="y" 
                                        values={orderedPlayers} 
                                        onReorder={setOrderedPlayers} 
                                        className="space-y-2"
                                    >
                                        {orderedPlayers.map((pid, index) => {
                                            const p = players.find(x => x.id === pid);
                                            // Insert "VS" separator visually between index 1 and 2
                                            return (
                                                <React.Fragment key={pid}>
                                                    {index === 2 && (
                                                        <div className="flex items-center justify-center py-1">
                                                            <div className="h-px bg-slate-700 w-full"></div>
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 rounded-full mx-2">VS</span>
                                                            <div className="h-px bg-slate-700 w-full"></div>
                                                        </div>
                                                    )}
                                                    <Reorder.Item value={pid} className="touch-none select-none">
                                                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between active:scale-[0.98] active:border-emerald-500/50 transition-all shadow-sm">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar src={p?.avatar} name={p?.name} className="w-6 h-6 rounded-full" />
                                                                <span className="text-sm font-medium text-slate-200">{p?.name.split(' ')[0]}</span>
                                                            </div>
                                                            <GripVertical size={16} className="text-slate-600" />
                                                        </div>
                                                    </Reorder.Item>
                                                </React.Fragment>
                                            );
                                        })}
                                    </Reorder.Group>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button 
                                            onClick={() => submitResult(item.id, 0)}
                                            className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 p-2 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Top Team Won
                                        </button>
                                        <button 
                                            onClick={() => submitResult(item.id, 1)}
                                            className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 p-2 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Bottom Team Won
                                        </button>
                                    </div>
                                    <button onClick={() => setEditingGameId(null)} className="w-full text-xs text-slate-500 py-1">Cancel</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {item.players.map(pid => {
                                        const p = players.find(x => x.id === pid);
                                        const isWinner = item.winners && item.winners.includes(pid);
                                        return (
                                            <div key={pid} className={`flex items-center space-x-2 text-sm ${isWinner ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                                                <div className="relative">
                                                    <Avatar src={p?.avatar} name={p?.name} className="w-5 h-5 rounded-full" />
                                                    {isWinner && <div className="absolute -top-1 -right-1 text-emerald-500"><Trophy size={8} fill="currentColor" /></div>}
                                                </div>
                                                <span className="truncate">{p?.name.split(' ')[0]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}