
import React, { useState } from 'react';
import { MistakeEntry } from '../types';
import { SUBJECTS } from '../constants';

interface MistakeBankProps {
  entries: MistakeEntry[];
  onAdd: (entry: MistakeEntry) => void;
}

export const MistakeBank: React.FC<MistakeBankProps> = ({ entries, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: SUBJECTS[0],
    topic: '',
    questionRef: '',
    whyIChoseIt: '',
    correctConcept: '',
    fixStrategy: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    });
    setFormData({ subject: SUBJECTS[0], topic: '', questionRef: '', whyIChoseIt: '', correctConcept: '', fixStrategy: '' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-2">
             <span className="text-rose-500 font-black text-sm tracking-[0.3em]">FAILURE_ANALYSIS</span>
             <div className="w-12 h-[1px] bg-white/10"></div>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">The Mistake <span className="text-rose-500">`Vault`</span></h2>
          <p className="text-slate-500 font-medium max-w-md">Every failure diagnosed is a mark gained in the final examination.</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-10 py-5 rounded-[2rem] font-black transition-all shadow-xl flex items-center space-x-3 uppercase tracking-tighter ${
            isOpen ? 'bg-slate-800 text-slate-400' : 'bg-rose-500 text-[#020617] hover:bg-rose-400 shadow-rose-500/20'
          }`}
        >
          <span>{isOpen ? '✕ Cancel' : '+ Log Critical Error'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject Domain</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white transition-all appearance-none"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Error Context (Topic)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Budgetary Process - Art 112"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white placeholder:text-slate-600" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Diagnosis (Why did I fail?)</label>
                <textarea 
                  value={formData.whyIChoseIt}
                  onChange={e => setFormData({...formData, whyIChoseIt: e.target.value})}
                  className="w-full p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl h-48 outline-none resize-none font-bold text-rose-100 placeholder:text-rose-900" 
                  placeholder="Analyze the cognitive gap..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Correction (The Ground Truth)</label>
                <textarea 
                  value={formData.correctConcept}
                  onChange={e => setFormData({...formData, correctConcept: e.target.value})}
                  className="w-full p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl h-48 outline-none resize-none font-bold text-emerald-100 placeholder:text-emerald-900" 
                  placeholder="What is the actual concept?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Anti-Recurrence Protocol</label>
                <textarea 
                  value={formData.fixStrategy}
                  onChange={e => setFormData({...formData, fixStrategy: e.target.value})}
                  className="w-full p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl h-48 outline-none resize-none font-bold text-indigo-100 placeholder:text-indigo-900" 
                  placeholder="Specific action for next time..."
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-white text-[#020617] py-6 rounded-[2rem] font-black text-lg hover:bg-rose-500 transition-all shadow-xl shadow-white/5 uppercase tracking-tighter">
              Archive Failure Diagnosis
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="text-6xl mb-6 opacity-20">💎</div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Zero Failure State</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium">No errors logged. Continue high-precision study or log your first mistake.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="group bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 hover:border-rose-500/30 transition-all duration-500 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="lg:w-1/4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-rose-500/20">
                      {entry.subject}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-2xl leading-tight group-hover:text-rose-400 transition-colors uppercase tracking-tight">{entry.topic}</h4>
                  <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                
                <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-rose-500/5 rounded-[2rem] border border-rose-500/10 flex flex-col h-full">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-4">Diagnosis</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-bold italic h-full">{entry.whyIChoseIt}</p>
                  </div>
                  <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex flex-col h-full">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-4">The Truth</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-bold italic h-full">{entry.correctConcept}</p>
                  </div>
                  <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex flex-col h-full">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-4">Anti-Recurrence</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-black h-full">{entry.fixStrategy}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
