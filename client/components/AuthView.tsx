
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Github, ShieldAlert } from 'lucide-react';

interface AuthViewProps {
  onLogin: (asAdmin?: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'admin';

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(mode === 'admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-white rounded-[2rem] shadow-2xl mb-6">
            <img src="./logo.png" alt="GyanSync Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {mode === 'login' ? 'Welcome to GyanSync' : mode === 'signup' ? 'Create GyanSync Account' : mode === 'admin' ? 'GyanSync Admin' : 'Recover Password'}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'login' ? 'Sync your knowledge, achieve your focus.' : mode === 'signup' ? 'Join thousands of students syncing their studies.' : mode === 'admin' ? 'System administrator access required.' : 'Enter your email to reset your credentials.'}
          </p>
        </div>

        <div className="glass border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Alex Johnson" 
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{mode === 'admin' ? 'Admin ID / Email' : 'Email Address'}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? "admin@gyansync.com" : "name@example.com"} 
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold text-[#F48B29] hover:text-[#D16C1D] uppercase"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className={`w-full font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${mode === 'admin' ? 'bg-[#1D265A] shadow-slate-200' : 'bg-[#1D265A] hover:bg-[#2A367A] shadow-[#1D265A]/10'} text-white`}
            >
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Get Started' : mode === 'admin' ? 'Authorize Access' : 'Send Recovery Link'}
              <ArrowRight size={20} />
            </button>
          </form>

          {mode !== 'admin' && (
            <div className="mt-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-4 text-slate-400 font-bold">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm">
                  <Github size={18} /> GitHub
                </button>
                <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm">
                  <ShieldCheck size={18} /> Google
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center flex flex-col gap-4">
          {mode === 'login' ? (
            <p className="text-slate-500 font-medium">
              Don't have an account? {' '}
              <button onClick={() => setMode('signup')} className="text-[#F48B29] font-bold hover:underline">Sign up for free</button>
            </p>
          ) : mode === 'admin' ? (
            <p className="text-slate-500 font-medium">
              Regular student? {' '}
              <button onClick={() => setMode('login')} className="text-[#1D265A] font-bold hover:underline">Student Login</button>
            </p>
          ) : (
            <p className="text-slate-500 font-medium">
              Already have an account? {' '}
              <button onClick={() => setMode('login')} className="text-[#1D265A] font-bold hover:underline">Log in</button>
            </p>
          )}

          {mode !== 'admin' && (
            <button 
              onClick={() => setMode('admin')}
              className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1D265A] transition-colors"
            >
              — Admin Portal —
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
