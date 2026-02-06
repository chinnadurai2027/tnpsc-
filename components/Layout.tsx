
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentDay: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentDay, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
    { id: 'syllabus', label: 'Audit', icon: '🎯' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    // Added mistakes tab to the navigation to house the MistakeBank component
    { id: 'mistakes', label: 'Vault', icon: '🔒' },
    { id: 'ca', label: 'CA Pulse', icon: '📰' },
    { id: 'history', label: 'History', icon: '📅' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617]">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-[#0a0f1e] p-6 flex flex-col hidden md:flex shrink-0 border-r border-white/5">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-[#020617] text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            *
          </div>
          <div className="flex flex-col leading-tight">
             <span className="text-white font-black text-lg tracking-tighter">TNPSC OS</span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v3.1 Final</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-emerald-500 text-[#020617] font-bold shadow-lg shadow-emerald-500/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl opacity-80">{item.icon}</span>
              <span className="font-bold text-sm uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5">
            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-emerald-500/60 mb-3">Live Session</p>
            <div className="flex items-center justify-between">
              <span className="text-white font-mono font-black text-lg">DAY {currentDay}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-h-screen relative">
        <header className="h-20 flex items-center justify-between px-8 md:px-12 glass border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
             <div className="md:hidden w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-[#020617] font-black text-xl shadow-lg shadow-emerald-500/20">*</div>
             <div className="flex flex-col">
                <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-0.5">
                  Protocol Stage
                </h2>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {navItems.find(i => i.id === activeTab)?.label}
                </h3>
             </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex flex-col text-right">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Persistence</span>
               <span className="text-xs font-bold text-slate-300">Local DB Active</span>
            </div>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      
      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 flex justify-around p-4 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
