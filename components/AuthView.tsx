
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

// Designated Admin and Owner emails
const MASTER_ADMINS = ['sorianoavegail32@gmail.com', 'thumbsolu@gmail.com'];

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    if (mode === 'login') {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Invalid credentials.');
      }
    } else if (mode === 'register') {
      if (users.some(u => u.email === email)) {
        setError('User already exists.');
        return;
      }

      // Check if this email is one of the designated owners/admins
      const isMasterAdmin = MASTER_ADMINS.includes(email.toLowerCase());

      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        username,
        password,
        // Designated owners get permanent admin rights
        isAdmin: isMasterAdmin || email.toLowerCase().includes('admin'),
        notificationsEnabled: false,
        joinedAt: new Date().toISOString(),
        subscriptionPlan: isMasterAdmin ? 'Enterprise' : 'Free',
        subscriptionActive: true,
        hasCompletedTour: false
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      onAuthSuccess(newUser);
    } else {
      // Recovery simulation
      setError('Password recovery link sent to email (Simulated).');
      setTimeout(() => setMode('login'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[100]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/20">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">IdeaFlow</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest text-center">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Flow' : 'Account Recovery'}
          </p>
          {mode === 'register' && (
            <p className="text-[10px] text-cyan-400 font-bold mt-2 animate-pulse">
              DESIGNATED ADMIN REGISTRATION ACTIVE
            </p>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" required
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {mode !== 'recovery' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {error && <p className="text-rose-500 text-xs font-bold px-2">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
          >
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
          {mode === 'login' ? (
            <>
              <p className="text-sm text-slate-500">
                New here? <button onClick={() => setMode('register')} className="text-cyan-400 font-bold hover:underline">Register</button>
              </p>
              <button onClick={() => setMode('recovery')} className="text-xs text-slate-600 hover:text-slate-400">Forgot password?</button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Already have an account? <button onClick={() => setMode('login')} className="text-cyan-400 font-bold hover:underline">Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
