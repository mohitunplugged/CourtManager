import React from 'react';
import { Gavel, Timer, UserCheck, Bolt, ExternalLink } from 'lucide-react';

export default function Rules() {
  return (
    <div className="space-y-6 text-slate-300 pb-20">
      {/* Late Policy Header */}
      <section className="bg-slate-800/40 rounded-xl p-5 border-l-4 border-amber-500 shadow-lg">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center">
          <Gavel className="mr-2 text-amber-500" size={20} />
          Late Policy
        </h2>
        <p className="text-sm leading-relaxed text-slate-400">
          We are humane, but fair. The session clock starts the moment the <strong>4th player checks in</strong>.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
            <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Grace Period</div>
            <div className="text-xs text-slate-300">10 mins after start (Equal Games)</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
            <div className="text-[10px] uppercase font-bold text-red-400 mb-1">Late Penalty</div>
            <div className="text-xs text-slate-300">1 game docked per 12 mins late</div>
          </div>
        </div>
      </section>

      {/* Logic Breakdown */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Scheduling Logic</h3>
        
        <div className="space-y-3">
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex items-start">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mr-4">
              <Timer size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dynamic Start Time</h4>
              <p className="text-xs text-slate-400 mt-1">The timeline adjusts to the exact second the 4th person arrives (T=0).</p>
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex items-start">
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400 mr-4">
              <UserCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fairness Buffer</h4>
              <p className="text-xs text-slate-400 mt-1">Arrivals within the grace period join the Game 2 queue with full rest credit.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex items-start">
            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400 mr-4">
              <Bolt size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Streak Breaker</h4>
              <p className="text-xs text-slate-400 mt-1">Logic prevents anyone from playing 3 games in a row unless absolutely necessary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spreadsheet Link */}
      <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
        <div className="text-xs text-slate-400 mb-3">Want to see the math behind the logic?</div>
        <a 
          href="https://docs.google.com/spreadsheets/d/1FMOj7VjdsSUcUqOVfILLsl_ZOJyKyEroTo18wI78S7g/edit?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" className="w-4 h-4" alt="" />
          <span>View Logic Spreadsheet</span>
          <ExternalLink size={14} />
        </a>
      </section>
    </div>
  );
}
