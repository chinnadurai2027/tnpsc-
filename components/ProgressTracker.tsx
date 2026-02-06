
import React, { useState } from 'react';
import { ProgressEntry } from '../types';
import { SUBJECTS } from '../constants';

interface ProgressTrackerProps {
  entries: ProgressEntry[];
  onAdd: (entry: ProgressEntry) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ entries, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: SUBJECTS[0],
    customSubject: '',
    topic: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = formData.subject === 'Others' ? formData.customSubject : formData.subject;
    onAdd({
      id: crypto.randomUUID(),
      subject: finalSubject || 'Miscellaneous',
      topic: formData.topic,
      notes: formData.notes,
      date: new Date().toISOString()
    });
    setFormData({ subject: SUBJECTS[0], customSubject: '', topic: '', notes: '' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-2">
             <span className="text-emerald-500 font-black text-sm tracking-[0.3em]">PROGRESS_INTEL</span>
             <div className="w-12 h-[1px] bg-white/10"></div>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Intelligence Logs</h2>
          <p className="text-slate-500 font-medium max-w-md">Document critical breakthroughs and syllabus advancements.</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-10 py-5 rounded-[2rem] font-black transition-all shadow-xl flex items-center space-x-3 uppercase tracking-tighter ${
            isOpen ? 'bg-slate-800 text-slate-400' : 'bg-white text-[#020617] hover:bg-emerald-500'
          }`}
        >
          <span>{isOpen ? '✕ Cancel' : '+ Archive Breakthrough'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject Mapping</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white transition-all appearance-none"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Topic Concept</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fundamental Duties - Swaran Singh Comm."
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl outline-none font-bold text-white placeholder:text-slate-600" 
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Key Intelligence / Insight Extracts</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl h-40 outline-none resize-none font-bold text-emerald-100 placeholder:text-emerald-900" 
                placeholder="What critical concept did you master in this session?"
              />
            </div>

            <button type="submit" className="w-full bg-white text-[#020617] py-6 rounded-[2rem] font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-white/5 uppercase tracking-tighter">
              Commit Intelligence
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {entries.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="text-6xl mb-6 opacity-20">📊</div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Vault Empty</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium">Capture your first study breakthrough to populate the global intel bank.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 flex flex-col group shadow-xl hover:shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                    {entry.subject}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono font-bold uppercase mt-2">Captured: {new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-600">⚡</div>
              </div>
              <h4 className="font-black text-white text-xl mb-4 leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{entry.topic}</h4>
              <div className="mt-auto pt-6 border-t border-white/5">
                <p className="text-sm text-slate-400 leading-relaxed font-bold italic">
                  "{entry.notes || "Topic completion protocol active."}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
