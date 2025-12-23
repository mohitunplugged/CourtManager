import React, { useState } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import Login from './components/Login';
import Roster from './components/Roster';
import Timeline from './components/Timeline';
import History from './components/History';
import Stats from './components/Stats';
import Rules from './components/Rules';
import HowTo from './components/HowTo';
import Avatar from './components/Avatar';
import { LayoutGrid, ScrollText, Trophy, Gavel, HelpCircle } from 'lucide-react';

function Dashboard() {
  const { currentUser, logout, socket, sessionState } = useSocket();
  const [activeTab, setActiveTab] = useState('app');

  const handleReset = () => {
    if (confirm('Reset the entire session? This clears all check-ins.')) {
        socket.emit('reset_session');
    }
  };

  const isSessionStarted = !!sessionState.actualStartTime;
  const presentCount = sessionState.players.filter(p => p.present).length;

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={handleReset} className="text-slate-600 hover:text-red-500 transition-colors" title="Reset Session">
                <Trophy size={20} className={isSessionStarted ? "text-emerald-500" : "text-slate-600"} />
            </button>
            <div>
                <h1 className="font-bold text-white tracking-tight leading-none">Court Manager</h1>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {sessionState.sessionDate ? sessionState.sessionDate.split(',')[0] + ' ' + sessionState.sessionDate.split(',')[1] : 'Loading...'} 
                    <span className="mx-1">•</span> 
                    {isSessionStarted ? 'Live' : `Waiting (${presentCount}/4)`}
                </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
              <button 
                onClick={logout}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded border border-slate-700 transition-colors uppercase font-bold tracking-wider"
              >
                Log Out
              </button>
              <Avatar src={currentUser.avatar} name={currentUser.name} className="w-8 h-8 rounded-full border border-slate-700" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        
        {activeTab === 'app' && (
            <>
                <Roster />
                <Timeline />
            </>
        )}

        {activeTab === 'history' && <History />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'howto' && <HowTo />}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16">
            <button 
                onClick={() => setActiveTab('app')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'app' ? 'text-emerald-400' : 'text-slate-500'}`}
            >
                <LayoutGrid size={18} />
                <span className="text-[8px] font-bold uppercase">Live</span>
            </button>
            
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
            >
                <ScrollText size={18} />
                <span className="text-[8px] font-bold uppercase">Log</span>
            </button>

             <button 
                onClick={() => setActiveTab('stats')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'stats' ? 'text-emerald-400' : 'text-slate-500'}`}
            >
                <Trophy size={18} />
                <span className="text-[8px] font-bold uppercase">Stats</span>
            </button>

            <button 
                onClick={() => setActiveTab('rules')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'rules' ? 'text-emerald-400' : 'text-slate-500'}`}
            >
                <Gavel size={18} />
                <span className="text-[8px] font-bold uppercase">Rules</span>
            </button>

            <button 
                onClick={() => setActiveTab('howto')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'howto' ? 'text-emerald-400' : 'text-slate-500'}`}
            >
                <HelpCircle size={18} />
                <span className="text-[8px] font-bold uppercase">Help</span>
            </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}
