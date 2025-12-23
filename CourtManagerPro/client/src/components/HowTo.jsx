import React from 'react';
import { MousePointer2, Users, Clipboard, Smartphone } from 'lucide-react';

export default function HowTo() {
  const steps = [
    {
      icon: <MousePointer2 className="text-emerald-500" />,
      title: "1. Select & Enter",
      desc: "Tap your profile on the login screen. You'll be automatically checked in as 'Present'."
    },
    {
      icon: <Users className="text-blue-400" />,
      title: "2. The 4th Player Trigger",
      desc: "Check-in 4 players to start the session clock. This is the moment penalties begin to calculate."
    },
    {
      icon: <Smartphone className="text-amber-400" />,
      title: "3. Manage Results",
      desc: "Tap 'Record Result' on any game. Drag players to arrange teams and tap the winning side."
    },
    {
      icon: <Clipboard className="text-purple-400" />,
      title: "4. Stay Synced",
      desc: "Every check-in and result is synced in real-time. Use the 'History' tab to audit past games."
    }
  ];

  return (
    <div className="space-y-8 pb-24 px-1">
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Start Guide</h2>
        <p className="text-sm text-slate-400 leading-relaxed">Everything you need to know about the new Court Manager Pro.</p>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 flex items-start space-x-4">
             {idx < steps.length - 1 && (
                 <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-800"></div>
             )}
             <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 shadow-inner">
                {step.icon}
             </div>
             <div className="pt-0.5">
                <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-850 p-4 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Legend</h3>
          <div className="space-y-3 text-[10px] uppercase tracking-wider font-bold">
              <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-emerald-500">Live Game</span>
              </div>
              <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span className="text-slate-400">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-red-500">Waiting for 4</span>
              </div>
          </div>
      </div>
    </div>
  );
}
