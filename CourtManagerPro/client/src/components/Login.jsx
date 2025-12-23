import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { User, Dices } from 'lucide-react';
import Avatar from './Avatar';

export default function Login() {
  const { sessionState, login, toggleStatus } = useSocket();
  const [selectedId, setSelectedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) return;
    
    // Auto-checkin logic: If I'm not marked present, check me in.
    const player = sessionState.players.find(p => p.id === selectedId);
    if (player && !player.present) {
        toggleStatus(selectedId);
    }
    
    login(selectedId);
  };

  // If session state isn't loaded yet, show loading
  if (!sessionState || !sessionState.players) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-500">
              Loading Roster...
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-2 shadow-lg shadow-emerald-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Court Check-In</h2>
          <p className="text-slate-400 text-sm">Select your profile to join the game.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {sessionState.players.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex items-center space-x-3
                        ${selectedId === p.id 
                            ? 'bg-emerald-600 border-emerald-500 ring-2 ring-emerald-500/30' 
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white'}
                    `}
                >
                    <Avatar src={p.avatar} name={p.name} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium truncate">{p.name.split(' ')[0]}</span>
                    
                    {selectedId === p.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                </button>
            ))}
        </div>

        <button 
            onClick={handleSubmit}
            disabled={!selectedId}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
        >
            Enter Court
        </button>
      </div>
    </div>
  );
}