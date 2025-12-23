import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Clock, Target, Medal } from 'lucide-react';
import Avatar from './Avatar';
import { buildApiUrl } from '../lib/api';

export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('/api/stats'))
      .then(res => res.json())
      .then(d => {
          setData(d);
          setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-500">Loading stats...</div>;
  if (!data) return <div className="text-center py-12 text-slate-500">No data available</div>;

  const { leaderboard, highlights } = data;

  return (
    <div className="space-y-6 pb-24">
       
       {/* Highlights Grid */}
       <div className="grid grid-cols-2 gap-3">
           {highlights.champion && (
               <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/10 border border-amber-500/30 p-3 rounded-xl flex flex-col items-center text-center">
                   <Trophy size={20} className="text-amber-400 mb-2" />
                   <div className="text-[10px] uppercase tracking-wider text-amber-200/60 font-bold mb-1">Champion</div>
                   <Avatar src={highlights.champion.avatar} name={highlights.champion.name} className="w-8 h-8 rounded-full mb-1" />
                   <div className="text-sm font-bold text-amber-100">{highlights.champion.name.split(' ')[0]}</div>
                   <div className="text-xs text-amber-200/80">{highlights.champion.wins} Wins</div>
               </div>
           )}

           {highlights.sharpshooter && (
               <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col items-center text-center">
                   <Target size={20} className="text-emerald-400 mb-2" />
                   <div className="text-[10px] uppercase tracking-wider text-emerald-200/60 font-bold mb-1">Sniper</div>
                   <Avatar src={highlights.sharpshooter.avatar} name={highlights.sharpshooter.name} className="w-8 h-8 rounded-full mb-1" />
                   <div className="text-sm font-bold text-emerald-100">{highlights.sharpshooter.name.split(' ')[0]}</div>
                   <div className="text-xs text-emerald-200/80">{highlights.sharpshooter.winRate}% Rate</div>
               </div>
           )}

           {highlights.ironMan && (
               <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/10 border border-blue-500/30 p-3 rounded-xl flex flex-col items-center text-center">
                   <Flame size={20} className="text-blue-400 mb-2" />
                   <div className="text-[10px] uppercase tracking-wider text-blue-200/60 font-bold mb-1">Iron Man</div>
                   <Avatar src={highlights.ironMan.avatar} name={highlights.ironMan.name} className="w-8 h-8 rounded-full mb-1" />
                   <div className="text-sm font-bold text-blue-100">{highlights.ironMan.name.split(' ')[0]}</div>
                   <div className="text-xs text-blue-200/80">{highlights.ironMan.total_games} Games</div>
               </div>
           )}

           {highlights.lateComer && (
               <div className="bg-gradient-to-br from-red-500/20 to-red-900/10 border border-red-500/30 p-3 rounded-xl flex flex-col items-center text-center">
                   <Clock size={20} className="text-red-400 mb-2" />
                   <div className="text-[10px] uppercase tracking-wider text-red-200/60 font-bold mb-1">Fashionably Late</div>
                   <Avatar src={highlights.lateComer.avatar} name={highlights.lateComer.name} className="w-8 h-8 rounded-full mb-1" />
                   <div className="text-sm font-bold text-red-100">{highlights.lateComer.name.split(' ')[0]}</div>
                   <div className="text-xs text-red-200/80">{highlights.lateComer.late_penalties} Penalties</div>
               </div>
           )}
       </div>

       {/* Leaderboard Table */}
       <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700">
           <div className="p-3 border-b border-white/5 bg-slate-800/60 flex items-center">
               <Medal size={14} className="text-slate-400 mr-2" />
               <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Leaderboard</h2>
           </div>
           
           <table className="w-full text-left text-sm">
               <thead className="bg-slate-900/50 text-[10px] uppercase text-slate-500 font-medium">
                   <tr>
                       <th className="px-3 py-2">Player</th>
                       <th className="px-2 py-2 text-center">Games</th>
                       <th className="px-2 py-2 text-center">Wins</th>
                       <th className="px-2 py-2 text-right">%</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                   {leaderboard.map((p, idx) => (
                       <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                           <td className="px-3 py-2.5 flex items-center">
                               <span className={`text-[10px] w-4 mr-2 font-mono ${idx < 3 ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>{idx + 1}</span>
                               <Avatar src={p.avatar} name={p.name} className="w-6 h-6 rounded-full mr-2" />
                               <span className="text-slate-200 font-medium">{p.name.split(' ')[0]}</span>
                           </td>
                           <td className="px-2 py-2 text-center text-slate-400">{p.total_games}</td>
                           <td className="px-2 py-2 text-center font-bold text-emerald-400">{p.wins}</td>
                           <td className="px-2 py-2 text-right text-slate-400 font-mono">{p.winRate}%</td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>
    </div>
  );
}
