
import React, { useState } from 'react';
import { CurrentAffairsEntry } from '../types';

interface CurrentAffairsProps {
  entries: CurrentAffairsEntry[];
  onAdd: (entry: CurrentAffairsEntry) => void;
}

export const CurrentAffairs: React.FC<CurrentAffairsProps> = ({ entries, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'National' as const,
    tag: 'Both' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    });
    setFormData({ title: '', content: '', category: 'National', tag: 'Both' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-2">
             <span className="text-indigo-400 font-black text-sm tracking-[0.3em]">DAILY_BRIEFING</span>
             <div className="w-12 h-[1px] bg-white/10"></div>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">CA Pulse Terminal</h2>
          <p className="text-slate-500 font-medium max-w-md">Distilling events into exam-ready insights.</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-10 py-5 rounded-[2rem] font-black transition-all shadow-xl flex items-center space-x-3 uppercase tracking-tighter ${
            isOpen ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          <span>{isOpen ? '✕ Close Terminal' : '+ Log Current Event'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Headline / Event Name</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white placeholder:text-slate-600" 
                    placeholder="e.g. TN Govt 'Mudhalvar Padaippagam' Scheme"
                    required
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scope</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white appearance-none"
                  >
                    <option value="National">National</option>
                    <option value="TN">Tamil Nadu</option>
                    <option value="International">International</option>
                  </select>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Bullet Points (Exam Utility)</label>
               <textarea 
                 value={formData.content}
                 onChange={e => setFormData({...formData, content: e.target.value})}
                 className="w-full p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl h-32 outline-none resize-none font-bold text-indigo-100 placeholder:text-indigo-900" 
                 placeholder="Key facts for Prelims & descriptive points for Mains..."
               />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-tighter">
              Broadcast to Memory Bank
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {entries.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Intel Logged</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium">Capture daily news to build your personalized exam-ready briefing.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
               <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${
                    entry.category === 'TN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                  }`}>
                    {entry.category} Scope
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{new Date(entry.date).toLocaleDateString()}</span>
               </div>
               <h4 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{entry.title}</h4>
               <p className="text-sm text-slate-400 leading-relaxed font-bold whitespace-pre-line border-t border-white/5 pt-6">
                 {entry.content}
               </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
