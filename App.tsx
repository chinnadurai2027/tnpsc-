
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CheckIn } from './components/CheckIn';
import { TaskExecutor } from './components/TaskExecutor';
import { ProgressTracker } from './components/ProgressTracker';
import { CurrentAffairs } from './components/CurrentAffairs';
import { SyllabusAudit } from './components/SyllabusAudit';
import { MistakeBank } from './components/MistakeBank';
import { AppState, DailyLog, StudySlot, StudyStatus, ProgressEntry, CurrentAffairsEntry, MistakeEntry } from './types';
import { INITIAL_APP_STATE } from './constants';
import { loadState, saveState } from './services/storageService';
import { analyzeDailyPerformance } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_APP_STATE);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    if (state !== INITIAL_APP_STATE) {
      saveState(state);
    }
  }, [state]);

  const handleCheckIn = (data: { date: string; dayNumber: number; tasks: Partial<StudySlot>[] }) => {
    const slots: StudySlot[] = data.tasks.map((task) => ({
      id: task.id || crypto.randomUUID(),
      subject: task.subject || 'Others',
      topic: task.topic || 'Untitled Topic',
      timeEstimate: task.timeEstimate || 60,
      outputExpected: task.outputExpected || 'Mastery',
      status: StudyStatus.PENDING
    }));

    const totalTime = slots.reduce((acc, s) => acc + s.timeEstimate, 0) / 60;

    const newLog: DailyLog = {
      date: data.date,
      dayNumber: data.dayNumber,
      availableTime: parseFloat(totalTime.toFixed(1)),
      constraints: 'Manual Agenda',
      slots,
      isCompleted: false
    };

    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
    setActiveTab('dashboard');
  };

  const handleSlotUpdate = (slotId: string, updates: Partial<StudySlot>) => {
    setState(prev => {
      const currentLog = prev.logs[prev.logs.length - 1];
      if (!currentLog) return prev;

      const updatedSlots = currentLog.slots.map(s => 
        s.id === slotId ? { ...s, ...updates } : s
      );

      const updatedTopics = { ...prev.completedTopics };
      if (updates.status === StudyStatus.DONE) {
        const slot = currentLog.slots.find(s => s.id === slotId);
        if (slot) {
          updatedTopics[slot.topic] = (updatedTopics[slot.topic] || 0) + 1;
        }
      }

      return {
        ...prev,
        completedTopics: updatedTopics,
        logs: prev.logs.map((l, i) => i === prev.logs.length - 1 ? { ...l, slots: updatedSlots } : l)
      };
    });
  };

  const completeDay = async () => {
    setLoading(true);
    try {
      const currentLog = state.logs[state.logs.length - 1];
      const analysis = await analyzeDailyPerformance(currentLog);
      
      setState(prev => {
        let newStreak = prev.streak || 0;
        const completedLogs = prev.logs.filter(l => l.isCompleted);
        
        if (completedLogs.length === 0) {
          newStreak = 1;
        } else {
          const lastCompleted = completedLogs[completedLogs.length - 1];
          const lastDate = new Date(lastCompleted.date);
          const currentDate = new Date(currentLog.date);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        return {
          ...prev,
          currentDayNumber: prev.currentDayNumber + 1,
          streak: newStreak,
          logs: prev.logs.map((l, i) => i === prev.logs.length - 1 ? { 
            ...l, 
            ...analysis,
            isCompleted: true 
          } : l)
        };
      });
    } catch (error) {
      console.error("EOD Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const addProgressEntry = (entry: ProgressEntry) => {
    setState(prev => ({
      ...prev,
      progressLogs: [entry, ...(prev.progressLogs || [])]
    }));
  };

  const addCurrentAffairs = (entry: CurrentAffairsEntry) => {
    setState(prev => ({
      ...prev,
      currentAffairs: [entry, ...(prev.currentAffairs || [])]
    }));
  };

  const addMistakeEntry = (entry: MistakeEntry) => {
    setState(prev => ({
      ...prev,
      mistakeEntries: [entry, ...(prev.mistakeEntries || [])]
    }));
  };

  const updateSyllabusProgress = (unitId: string, percentage: number) => {
    setState(prev => ({
      ...prev,
      syllabusProgress: { ...prev.syllabusProgress, [unitId]: percentage }
    }));
  };

  const currentLog = state.logs[state.logs.length - 1];
  const isTodayStarted = currentLog && currentLog.date === new Date().toISOString().split('T')[0];

  const renderDashboard = () => {
    if (!isTodayStarted || currentLog?.isCompleted) {
      return <CheckIn dayNumber={state.currentDayNumber} onComplete={handleCheckIn} />;
    }
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950/80 border border-white/5 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-emerald-500/10 pointer-events-none font-black text-9xl">OS</div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">Execution Phase Active</h2>
            <div className="flex flex-wrap items-center gap-4">
               <span className="text-emerald-500 font-bold">DAY {state.currentDayNumber} Protocol</span>
               <span className="h-4 w-[1px] bg-white/20"></span>
               <span className="text-slate-400 font-medium">{currentLog.availableTime} Hours Allocated</span>
               <span className="h-4 w-[1px] bg-white/20"></span>
               <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                  <span className="text-lg">🔥</span>
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest">{state.streak || 0} DAY STREAK</span>
               </div>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-5 rounded-3xl flex items-center space-x-4 relative z-10">
             <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
             <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Persistence Engaged</span>
          </div>
        </div>
        <TaskExecutor 
          slots={currentLog.slots} 
          onSlotUpdate={handleSlotUpdate}
          onCompleteDay={completeDay}
        />
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white tracking-tight uppercase">Continuity Logs</h2>
      <div className="grid grid-cols-1 gap-4">
        {state.logs.length === 0 ? (
          <p className="text-slate-400 py-20 text-center italic border border-dashed rounded-3xl">No completed logs yet.</p>
        ) : (
          [...state.logs].reverse().map((log, i) => (
            <div key={i} className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/20 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white">Day {log.dayNumber} Protocol</h4>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{new Date(log.date).toLocaleDateString()} • {log.availableTime} Hours</p>
                </div>
                {log.verdict && (
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    log.verdict === 'Strong' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {log.verdict}
                  </span>
                )}
              </div>
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-300 italic font-medium leading-relaxed">"{log.correction}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Layout currentDay={state.currentDayNumber} activeTab={activeTab} setActiveTab={setActiveTab}>
      {loading && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_#10b981]"></div>
          <h3 className="text-4xl font-black tracking-tighter mb-2 uppercase">Syncing Neural Paths</h3>
          <p className="text-emerald-400/60 font-black uppercase tracking-widest text-xs">Analyzing daily throughput parameters...</p>
        </div>
      )}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'syllabus' && <SyllabusAudit progress={state.syllabusProgress} onUpdate={updateSyllabusProgress} />}
      {activeTab === 'progress' && <ProgressTracker entries={state.progressLogs || []} onAdd={addProgressEntry} />}
      {activeTab === 'mistakes' && <MistakeBank entries={state.mistakeEntries || []} onAdd={addMistakeEntry} />}
      {activeTab === 'ca' && <CurrentAffairs entries={state.currentAffairs || []} onAdd={addCurrentAffairs} />}
      {activeTab === 'history' && renderHistory()}

      {currentLog?.isCompleted && activeTab === 'dashboard' && (
        <div className="mt-12 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="bg-[#0f172a] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className={`p-10 text-white flex justify-between items-center ${
              currentLog.verdict === 'Strong' ? 'bg-gradient-to-r from-emerald-600 to-emerald-900' : 
              currentLog.verdict === 'Average' ? 'bg-gradient-to-r from-amber-600 to-amber-900' : 'bg-gradient-to-r from-rose-600 to-rose-900'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 block mb-2">Diagnostic Result</span>
                <h3 className="text-5xl font-black tracking-tighter uppercase">{currentLog.verdict} State</h3>
              </div>
              <div className="text-6xl filter drop-shadow-2xl">
                {currentLog.verdict === 'Strong' ? '⚡' : '⚖️'}
              </div>
            </div>
            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Correction</h4>
                <div className="bg-slate-950 p-8 rounded-3xl border border-white/5 shadow-inner">
                  <p className="text-2xl md:text-3xl text-white font-black leading-tight tracking-tight italic">
                    "{currentLog.correction}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
