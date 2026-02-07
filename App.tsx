
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CheckIn } from './components/CheckIn';
import { TaskExecutor } from './components/TaskExecutor';
import { ProgressTracker } from './components/ProgressTracker';
import { CurrentAffairs } from './components/CurrentAffairs';
import { SyllabusAudit } from './components/SyllabusAudit';
import { MistakeBank } from './components/MistakeBank';
import { Auth } from './components/Auth';
import { AppState, DailyLog, StudySlot, StudyStatus, ProgressEntry, CurrentAffairsEntry, MistakeEntry, User } from './types';
import { INITIAL_APP_STATE } from './constants';
import { saveUserData, loadUserData, getSessionId, saveSessionId, clearSession } from './services/storageService';
import { analyzeDailyPerformance } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_APP_STATE);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const initAuth = async () => {
      const sessId = getSessionId();
      if (sessId) {
        const saved = await loadUserData(sessId);
        if (saved) {
          setState(saved);
        }
      }
      setBooting(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (state.user) {
      saveUserData(state);
    }
  }, [state]);

  const handleAuthSuccess = async (user: User) => {
    setLoading(true);
    const data = await loadUserData(user.id);
    if (data) {
      setState(data);
    } else {
      setState({ ...INITIAL_APP_STATE, user });
    }
    saveSessionId(user.id);
    setLoading(false);
  };

  const handleLogout = () => {
    clearSession();
    setState(INITIAL_APP_STATE);
  };

  const handleCheckIn = (data: { date: string; dayNumber: number; tasks: Partial<StudySlot>[] }) => {
    const slots: StudySlot[] = data.tasks.map((task) => ({
      id: task.id || crypto.randomUUID(),
      subject: task.subject || 'Others',
      topic: task.topic || 'Untitled Topic',
      timeEstimate: task.timeEstimate || 60,
      outputExpected: task.outputExpected || 'Mastery',
      status: StudyStatus.PENDING
    }));

    const totalTime = slots.reduce((acc, s) => acc + (s.timeEstimate || 0), 0) / 60;

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
      const lastLogIdx = prev.logs.length - 1;
      const currentLog = prev.logs[lastLogIdx];
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
        logs: prev.logs.map((l, i) => i === lastLogIdx ? { ...l, slots: updatedSlots } : l)
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

  // Interleave and sort all achievement types for the History timeline
  const timelineData = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      type: 'LOG' | 'INTEL' | 'ERROR' | 'CA';
      data: any;
    }> = [];

    state.logs.filter(l => l.isCompleted).forEach(log => {
      items.push({ id: `log-${log.date}-${log.dayNumber}`, date: log.date, type: 'LOG', data: log });
    });

    state.progressLogs.forEach(entry => {
      items.push({ id: `intel-${entry.id}`, date: entry.date, type: 'INTEL', data: entry });
    });

    state.mistakeEntries.forEach(mistake => {
      items.push({ id: `error-${mistake.id}`, date: mistake.date, type: 'ERROR', data: mistake });
    });

    state.currentAffairs.forEach(ca => {
      items.push({ id: `ca-${ca.id}`, date: ca.date, type: 'CA', data: ca });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.logs, state.progressLogs, state.mistakeEntries, state.currentAffairs]);

  if (booting) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!state.user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

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
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Mastery Timeline</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">A unified feed of your execution, intelligence, and news alerts.</p>
      </div>

      <div className="relative space-y-8 before:absolute before:left-6 md:before:left-1/2 before:top-0 before:bottom-0 before:w-[1px] before:bg-white/5">
        {timelineData.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] col-span-full">
             <p className="text-slate-600 italic">Zero activities archived. Initialize your first protocol.</p>
          </div>
        ) : (
          timelineData.map((item) => (
            <div key={item.id} className="relative flex flex-col md:flex-row md:items-center group">
              <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#020617] z-10 ${
                item.type === 'LOG' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                item.type === 'INTEL' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                item.type === 'ERROR' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
              }`}></div>

              <div className={`ml-16 md:ml-0 md:w-1/2 ${['INTEL', 'CA'].includes(item.type) ? 'md:pr-16 md:text-right md:order-1' : 'md:pl-16 md:order-2'}`}>
                <div className={`bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all shadow-xl ${
                  item.type === 'LOG' ? 'hover:border-emerald-500/20' : 
                  item.type === 'INTEL' ? 'hover:border-indigo-500/20' : 
                  item.type === 'ERROR' ? 'hover:border-rose-500/20' :
                  'hover:border-violet-500/20'
                }`}>
                  <div className={`flex flex-col ${['INTEL', 'CA'].includes(item.type) ? 'md:items-end' : 'md:items-start'} mb-4`}>
                    <div className="flex items-center space-x-3 mb-2">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                        item.type === 'LOG' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        item.type === 'INTEL' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        item.type === 'ERROR' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-violet-500/10 text-violet-400 border-violet-500/20'
                       }`}>
                        {item.type === 'LOG' ? 'Execution' : item.type === 'INTEL' ? 'Breakthrough' : item.type === 'ERROR' ? 'Diagnosis' : 'News Brief'}
                       </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</p>
                  </div>

                  {item.type === 'LOG' && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-white">Day {item.data.dayNumber} Protocol</h4>
                      <div className="bg-slate-950/50 p-4 rounded-2xl">
                         <p className="text-xs text-slate-400 italic leading-relaxed">Correction: "{item.data.correction}"</p>
                      </div>
                    </div>
                  )}

                  {item.type === 'INTEL' && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.data.topic}</h4>
                      <p className="text-sm text-slate-400 italic font-bold">"{item.data.notes}"</p>
                    </div>
                  )}

                  {item.type === 'ERROR' && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-rose-400 uppercase tracking-tight">{item.data.topic}</h4>
                      <p className="text-xs text-slate-400 font-bold bg-slate-950 p-4 rounded-xl">Fact: {item.data.correctConcept}</p>
                    </div>
                  )}

                  {item.type === 'CA' && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-violet-400 uppercase tracking-tight">{item.data.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed truncate">{item.data.content}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Layout currentDay={state.currentDayNumber} activeTab={activeTab} setActiveTab={setActiveTab} user={state.user} onLogout={handleLogout}>
      {loading && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_#10b981]"></div>
          <h3 className="text-4xl font-black tracking-tighter mb-2 uppercase">Syncing Neural Paths</h3>
          <p className="text-emerald-400/60 font-black uppercase tracking-widest text-xs">Accessing IndexedDB Local Bank...</p>
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
