import React, { useEffect, useState } from 'react';
import { ScrollText, Trophy, Calendar } from 'lucide-react';
import { buildApiUrl } from '../lib/api';

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('/api/history'))
      .then(res => res.json())
      .then(data => {
          setLogs(data.logs);
          setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  if (loading) {
      return <div className="text-center py-12 text-slate-500">Loading history...</div>;
  }

  // Filter for Game Completions and Check-ins for a cleaner view
  const gameLogs = logs.filter(l => l.action === 'GAME_COMPLETE');

  return (
    <div className="space-y-6 pb-20">
       <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
               <Calendar size={14} className="mr-2" /> Recent Games
           </h2>
           
           {gameLogs.length === 0 ? (
               <div className="text-center py-8 text-slate-500 text-sm">
                   No games recorded yet.
               </div>
           ) : (
               <div className="space-y-3">
                   {gameLogs.map(log => (
                       <div key={log.id} className="bg-slate-900/50 p-3 rounded-lg border-l-2 border-emerald-500">
                           <div className="flex justify-between items-start mb-1">
                               <div className="text-[10px] text-slate-500 font-mono">
                                   {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                           </div>
                           <div className="text-sm text-slate-300">
                               <span className="text-emerald-400 font-bold"><Trophy size={12} className="inline mr-1"/> Winners:</span> {log.details.replace('Game ', '').split(' won by ')[1]}
                           </div>
                           <div className="text-xs text-slate-500 mt-1">
                               {log.details.split(' won by ')[0]}
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>

       <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
               <ScrollText size={14} className="mr-2" /> Audit Log
           </h2>
           <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
               {logs.map(log => (
                   <div key={log.id} className="text-xs border-b border-white/5 pb-2 last:border-0">
                       <div className="flex justify-between text-slate-500 mb-0.5 font-mono text-[10px]">
                           <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                           <span className={`px-1 rounded ${
                               log.action === 'CHECK_IN' ? 'bg-emerald-900/30 text-emerald-500' :
                               log.action === 'CHECK_OUT' ? 'bg-red-900/30 text-red-500' :
                               'bg-slate-700 text-slate-300'
                           }`}>{log.action}</span>
                       </div>
                       <div className="text-slate-300">{log.details}</div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
