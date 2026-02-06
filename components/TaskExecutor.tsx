
import React, { useState, useEffect } from 'react';
import { StudySlot, StudyStatus, Difficulty } from '../types';

interface TaskExecutorProps {
  slots: StudySlot[];
  onSlotUpdate: (slotId: string, updates: Partial<StudySlot>) => void;
  onCompleteDay: () => void;
}

export const TaskExecutor: React.FC<TaskExecutorProps> = ({ slots, onSlotUpdate, onCompleteDay }) => {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const activeSlot = slots.find(s => s.id === activeSlotId);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startSlot = (slot: StudySlot) => {
    setActiveSlotId(slot.id);
    setTimeLeft(slot.timeEstimate * 60);
    setIsTimerRunning(true);
  };

  const handleFinish = (status: StudyStatus, difficulty: Difficulty, confusions: string) => {
    if (activeSlotId) {
      onSlotUpdate(activeSlotId, { 
        status, 
        difficulty, 
        confusions, 
        timeTaken: activeSlot ? (activeSlot.timeEstimate * 60 - timeLeft) / 60 : 0 
      });
      setActiveSlotId(null);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {activeSlot ? (
        <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col items-center justify-center p-8 sm:p-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_#10b981]" 
              style={{ width: `${(timeLeft / (activeSlot.timeEstimate * 60)) * 100}%` }}
            ></div>
          </div>

          <div className="max-w-4xl w-full text-center space-y-16 relative">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Deep Execution Phase</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">{activeSlot.subject}</h2>
              <p className="text-slate-500 text-xl font-bold tracking-tight">{activeSlot.topic}</p>
            </div>

            <div className="relative inline-block">
              <div className="text-[9rem] md:text-[18rem] font-mono font-black text-white tracking-tighter leading-none">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center mt-8 space-x-6">
                 <button 
                   onClick={() => setIsTimerRunning(!isTimerRunning)}
                   className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-bold hover:text-white transition-all uppercase tracking-widest text-xs"
                 >
                   {isTimerRunning ? '⏸ Pause Protocol' : '▶ Resume Protocol'}
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 text-left">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Task Objective</span>
                <p className="text-white font-bold leading-relaxed">Ensure conceptual clarity of the topic and complete PYQ mapping.</p>
              </div>
              <div className="bg-emerald-500 text-[#020617] p-8 rounded-[2rem] text-left flex items-center space-x-6 shadow-2xl shadow-emerald-500/20">
                <span className="text-4xl">📵</span>
                <p className="font-black text-sm uppercase tracking-tight leading-tight">Phone Isolated.<br/>Environment Controlled.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-12">
              <button 
                onClick={() => handleFinish(StudyStatus.DONE, Difficulty.MODERATE, '')}
                className="px-12 py-6 bg-emerald-500 text-[#020617] rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-emerald-500/30"
              >
                SUCCESSFUL COMPLETION ✓
              </button>
              <button 
                onClick={() => handleFinish(StudyStatus.PARTIAL, Difficulty.MODERATE, '')}
                className="px-12 py-6 bg-white/5 text-slate-400 rounded-3xl font-bold text-lg hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                Abort / Partial ⚠️
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* List Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black text-white tracking-tight uppercase">Protocol Roadmap</h3>
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                 Efficiency: {slots.length > 0 ? 'High' : 'N/A'}
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {slots.map((slot, index) => (
                <div 
                  key={slot.id} 
                  className={`group relative overflow-hidden bg-[#0f172a] border rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:border-emerald-500/30 ${
                    slot.status === StudyStatus.DONE ? 'border-emerald-500/20 bg-emerald-500/5' : 
                    slot.status === StudyStatus.PENDING ? 'border-white/5' : 'border-amber-500/20 bg-amber-500/5'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start space-x-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-all duration-500 ${
                        slot.status === StudyStatus.DONE ? 'bg-emerald-500 text-[#020617]' : 
                        'bg-slate-800 text-slate-500 border border-white/10 group-hover:border-emerald-500/50'
                      }`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{slot.subject}</span>
                          {slot.status === StudyStatus.DONE && (
                            <div className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span className="text-emerald-500 text-[9px] font-black uppercase">Archived</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{slot.topic}</h4>
                        <div className="flex items-center space-x-4 text-slate-500">
                           <span className="text-xs font-bold uppercase tracking-widest flex items-center space-x-1">
                              <span>⏱</span>
                              <span>{slot.timeEstimate}m Block</span>
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end space-x-8 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                      {slot.status === StudyStatus.PENDING ? (
                        <button 
                          onClick={() => startSlot(slot)}
                          className="bg-white text-[#020617] px-10 py-4 rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-white/5 hover:shadow-emerald-500/20 active:scale-95 uppercase tracking-tighter"
                        >
                          Execute Block
                        </button>
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg ${
                           slot.status === StudyStatus.DONE ? 'bg-emerald-500 text-[#020617]' : 'bg-amber-500 text-[#020617]'
                        }`}>
                          {slot.status === StudyStatus.DONE ? '✓' : '!'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl space-y-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Today's Pulse</h3>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Completion</span>
                      <span className="text-2xl font-black text-white">
                        {Math.round((slots.filter(s => s.status === StudyStatus.DONE).length / slots.length) * 100 || 0)}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${(slots.filter(s => s.status === StudyStatus.DONE).length / slots.length) * 100 || 0}%` }}
                      ></div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                   <div className="p-6 rounded-[1.5rem] bg-slate-800/40 border border-white/5">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Target Remaining</span>
                      <span className="text-xl font-bold text-white leading-none">
                         {slots.filter(s => s.status === StudyStatus.PENDING).reduce((a, b) => a + b.timeEstimate, 0)} <span className="text-xs text-slate-500">MINS</span>
                      </span>
                   </div>
                </div>

                {slots.every(s => s.status !== StudyStatus.PENDING) && slots.length > 0 && (
                  <button 
                    onClick={onCompleteDay}
                    className="w-full py-6 bg-emerald-500 text-[#020617] rounded-[2rem] font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-tighter mt-4"
                  >
                    Commit Daily Log →
                  </button>
                )}
             </div>

             <div className="bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 p-10">
                <p className="text-xs font-bold text-emerald-500 italic leading-relaxed">
                  "Execution is the only differentiator. The syllabus is same for everyone, the tracker is what defines the winner."
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
