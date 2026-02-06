
import React from 'react';
import { TNPSC_SYLLABUS } from '../constants';

interface SyllabusAuditProps {
  progress: Record<string, number>;
  onUpdate: (unitId: string, percentage: number) => void;
}

export const SyllabusAudit: React.FC<SyllabusAuditProps> = ({ progress, onUpdate }) => {
  return (
    <div className="space-y-12 pb-24">
      <div className="space-y-2 border-b border-white/5 pb-10">
        <div className="flex items-center space-x-3 mb-2">
           <span className="text-emerald-500 font-black text-sm tracking-[0.3em]">MISSION_OVERVIEW</span>
           <div className="w-12 h-[1px] bg-white/10"></div>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Syllabus Coverage Audit</h2>
        <p className="text-slate-500 font-medium max-w-md">Quantifying your journey through the Group 1 landscape.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TNPSC_SYLLABUS.map(unit => (
          <div key={unit.id} className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-start justify-between">
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UNIT {unit.id.replace('u', '')}</span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{unit.name}</h4>
               </div>
               <div className="text-3xl font-black text-emerald-500 font-mono">{progress[unit.id] || 0}%</div>
            </div>

            <div className="space-y-4">
               <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    style={{ width: `${progress[unit.id] || 0}%` }}
                  ></div>
               </div>
               <input 
                 type="range" 
                 min="0" max="100" step="5"
                 value={progress[unit.id] || 0}
                 onChange={(e) => onUpdate(unit.id, parseInt(e.target.value))}
                 className="w-full accent-emerald-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Not Started</span>
                  <span>Unit Completion protocol</span>
                  <span>Fully Mastered</span>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-emerald-500 text-[#020617] p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tight uppercase leading-none">Global Progress Audit</h3>
            <p className="font-bold text-sm opacity-80 uppercase tracking-widest">Weighted completion across all 10 Mission Units</p>
         </div>
         <div className="text-6xl font-black font-mono">
           {Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / 10)}%
         </div>
      </div>
    </div>
  );
};
