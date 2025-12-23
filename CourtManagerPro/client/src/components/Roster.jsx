import React from 'react';
import { useSocket } from '../context/SocketContext';
import { UserCheck, User, Clock } from 'lucide-react';
import Avatar from './Avatar';

export default function Roster() {
  const { sessionState, currentUser, toggleStatus } = useSocket();
  
  // Sort: Present first, then by name
  const sortedPlayers = [...sessionState.players].sort((a, b) => {
      if (a.present && !b.present) return -1;
      if (!a.present && b.present) return 1;
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Roster</h2>
            <div className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded-md font-mono">
                {sessionState.players.filter(p => p.present).length} Checked In
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            {sortedPlayers.map((player) => {
                const isMe = currentUser && player.id === currentUser.id;
                
                return (
                    <button
                        key={player.id}
                        onClick={() => toggleStatus(player.id)}
                        className={`
                            relative flex items-center p-3 rounded-xl border text-left transition-all duration-200
                            ${player.present 
                                ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]' 
                                : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:bg-slate-800/60'}
                        `}
                    >
                        <div className="relative mr-3">
                            <Avatar src={player.avatar} name={player.name} className="w-8 h-8 rounded-full border border-slate-700" />
                            {player.present && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                                    <UserCheck size={8} className="text-white" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-slate-200">
                                {player.name} {isMe && <span className="text-xs text-slate-500">(You)</span>}
                            </div>
                            
                            {player.present && player.latePenalty > 0 && (
                                <div className="flex items-center text-[10px] text-red-400 mt-0.5 font-mono">
                                    <Clock size={10} className="mr-1" />
                                    -{player.latePenalty} Games
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
            
            {sortedPlayers.length === 0 && (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <p className="text-slate-600 text-sm">Waiting for players...</p>
                </div>
            )}
        </div>
    </div>
  );
}
