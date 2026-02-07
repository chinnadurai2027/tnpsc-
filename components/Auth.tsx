
import React, { useState, useEffect } from 'react';
import { registerUser, authenticateUser, getAllUsers } from '../services/storageService';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers().then(setExistingUsers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await authenticateUser(username);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Access Denied. User not found in database.');
        }
      } else {
        const user = await registerUser(username);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError('Database connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] mx-auto flex items-center justify-center text-[#020617] text-4xl font-black shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-8">
            *
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3">Neural Access Gate</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase opacity-60">TNPSC Group 1 Execution OS</p>
        </div>

        <div className="bg-[#0f172a]/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">Identity Protocol</label>
              <input 
                type="text" 
                placeholder="Enter Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-6 bg-slate-950 border border-white/5 rounded-2xl outline-none font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/50 transition-all text-center text-lg tracking-tight"
                required
              />
              {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center mt-2">{error}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-emerald-500 text-[#020617] rounded-3xl font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] uppercase tracking-tighter"
            >
              {loading ? 'Initializing...' : isLogin ? 'Access Core' : 'Create Identity'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 flex flex-col items-center space-y-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest"
            >
              {isLogin ? 'New Aspirant? Register identity' : 'Existing Aspirant? Return to gate'}
            </button>

            {existingUsers.length > 0 && isLogin && (
              <div className="w-full space-y-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Previous Identities</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {existingUsers.slice(0, 3).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => setUsername(u.username)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      {u.username}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-40">
          Local DB Active • Encrypted Path
        </div>
      </div>
    </div>
  );
};
