
import React, { useState } from 'react';
import { SUBJECTS } from '../constants';
import { StudySlot, StudyStatus } from '../types';

interface CheckInProps {
  dayNumber: number;
  onComplete: (data: { date: string; dayNumber: number; tasks: Partial<StudySlot>[] }) => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ dayNumber, onComplete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Partial<StudySlot>[]>([]);
  
  const [currentTask, setCurrentTask] = useState({
    subject: SUBJECTS[0],
    customSubject: '',
    topic: '',
    duration: 60
  });

  const addTask = () => {
    if (!currentTask.topic) return;
    const finalSubject = currentTask.subject === 'Others' ? currentTask.customSubject : currentTask.subject;
    const newTask: Partial<StudySlot> = {
      id: crypto.randomUUID(),
      subject: finalSubject || 'Miscellaneous',
      topic: currentTask.topic,
      timeEstimate: currentTask.duration,
      outputExpected: 'Topic Mastery',
      status: StudyStatus.PENDING
    };
    setTasks([...tasks, newTask]);
    setCurrentTask({ ...currentTask, topic: '', customSubject: '' });
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.length === 0) return;
    onComplete({ date, dayNumber, tasks });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-16">
        <div className="flex items-center space-x-4 mb-4">
           <span className="text-emerald-500 font-black text-xl tracking-[0.3em]">INIT_SYSTEM</span>
           <div className="h-[1px] flex-grow bg-white/5"></div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
          Today's Plan <span className="text-emerald-500">`Made`</span><br/>Better.
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-xl">Configure your high-impact session blocks. Minimum friction, maximum retention.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          {/* Config Block */}
          <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 font-bold border border-white/10">01</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Configure Block</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject Category</label>
                <select 
                  value={currentTask.subject}
                  onChange={e => setCurrentTask({...currentTask, subject: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none font-bold text-white transition-all appearance-none"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Time Allocation (Min)</label>
                <input 
                  type="number" 
                  step="15"
                  value={currentTask.duration}
                  onChange={e => setCurrentTask({...currentTask, duration: parseInt(e.target.value) || 0})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none font-mono font-bold text-emerald-400" 
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Specific Topic Focus</label>
                <input 
                  type="text" 
                  placeholder="e.g. Directive Principles of State Policy"
                  value={currentTask.topic}
                  onChange={e => setCurrentTask({...currentTask, topic: e.target.value})}
                  className="w-full p-5 bg-[#1e293b]/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none font-bold text-white placeholder:text-slate-600" 
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={addTask}
              className="w-full py-5 bg-white text-[#020617] rounded-3xl font-black text-sm hover:bg-emerald-500 transition-all uppercase tracking-widest flex items-center justify-center space-x-3 shadow-xl shadow-white/5"
            >
              <span>+ Inject Slot</span>
            </button>
          </div>

          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between">
             <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">📅</div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Timeline</p>
                  <p className="font-bold text-white">{new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
             </div>
             <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-emerald-500 text-sm cursor-pointer"
              />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 p-10 flex flex-col h-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-emerald-500/10 pointer-events-none font-black text-8xl">02</div>
            
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center space-x-3">
              <span className="text-emerald-500">⚡</span>
              <span>Sequence</span>
            </h3>
            
            <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] pr-2">
              {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-16 h-16 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-slate-600">?</div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No slots configured</p>
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div key={task.id} className="flex items-center justify-between p-5 bg-[#1e293b]/30 rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">{idx + 1}</div>
                      <div>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">{task.subject}</p>
                        <p className="font-bold text-white text-sm truncate max-w-[150px]">{task.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-slate-400 text-xs font-bold">{task.timeEstimate}m</span>
                      <button 
                        onClick={() => removeTask(task.id!)}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {tasks.length > 0 && (
              <button 
                onClick={handleSubmit}
                className="w-full mt-10 bg-emerald-500 text-[#020617] py-6 rounded-[2rem] font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] uppercase tracking-tighter"
              >
                Begin Mission →
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Effort</span>
                <span className="text-xl font-black text-white">{Math.round(tasks.reduce((a, b) => a + (b.timeEstimate || 0), 0) / 60 * 10) / 10}h</span>
             </div>
             <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Blocks</span>
                <span className="text-xl font-black text-white">{tasks.length} Slots</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
