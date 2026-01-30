
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Github, ShieldAlert, Check } from 'lucide-react';
import { authService, User } from '../services/authService';

interface AuthViewProps {
  onLogin: (user: User, asAdmin?: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'admin' | 'forgot-sent';

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password reset states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // If the app is opened with a reset token in the URL (e.g. /reset?token=xyz),
  // Handle initial URL (token query or pathname) and browser navigation
  useEffect(() => {
    const applyLocation = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
          // If there's a token in the URL, go to reset mode and prefill it.
          setResetToken(token);
          setMode('reset');
          // Replace the URL to remove query param (avoid exposing token)
          window.history.replaceState(null, '', '/reset');
          return;
        }

        // No token: determine mode by pathname
        const path = window.location.pathname || '/';
        switch (path) {
          case '/signup':
            setMode('signup');
            break;
          case '/forgot':
            setMode('forgot');
            break;
          case '/forgot-sent':
            setMode('forgot-sent');
            break;
          case '/reset':
            setMode('reset');
            break;
          case '/admin':
            setMode('admin');
            break;
          default:
            setMode('login');
        }
      } catch (e) {
        // ignore (SSR or unsupported env)
      }
    };

    applyLocation();

    const onPop = () => applyLocation();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Sync mode -> URL so clicking mode links updates the address bar
  useEffect(() => {
    try {
      const modeToPath: Record<AuthMode, string> = {
        login: '/',
        signup: '/signup',
        forgot: '/forgot',
        'forgot-sent': '/forgot-sent',
        reset: '/reset',
        admin: '/admin'
      };
      const target = modeToPath[mode] || '/';
      if (window.location.pathname !== target) {
        // Use pushState to allow user to go back to previous page
        window.history.pushState(null, '', target);
      }
    } catch (e) {
      // ignore
    }
  }, [mode]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'forgot') {
        // Request password reset
        const response = await authService.requestPasswordReset(email);
        setSuccess(response.message || 'Password reset link has been sent to your email!');
        setResetEmail(email);
        setMode('forgot-sent');
      } else if (mode === 'reset') {
        // Confirm new password with token from URL
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const response = await authService.resetPassword(resetToken, newPassword, confirmPassword);
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          setResetToken('');
          setNewPassword('');
          setConfirmPassword('');
          setEmail('');
        }, 2000);
      } else if (mode === 'signup') {
        const response = await authService.signup(name, email, password);
        localStorage.setItem('token', response.token);
        onLogin(response.user);
      } else {
        const response = await authService.login(email, password);
        localStorage.setItem('token', response.token);
        onLogin(response.user, mode === 'admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-white rounded-[2rem] shadow-2xl mb-6">
            <img src="/logo.png" alt="GyanSync Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {mode === 'login' ? 'Welcome to GyanSync' : mode === 'signup' ? 'Create GyanSync Account' : mode === 'admin' ? 'GyanSync Admin' : mode === 'forgot' ? 'Reset Password' : mode === 'forgot-sent' ? 'Check Your Email' : 'Set New Password'}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'login' ? 'Sync your knowledge, achieve your focus.' : mode === 'signup' ? 'Join thousands of students syncing their studies.' : mode === 'admin' ? 'System administrator access required.' : mode === 'forgot' ? 'Enter your email to receive a password reset link.' : mode === 'forgot-sent' ? 'We sent a password reset link to your email. Follow the link to create a new password.' : 'Create a strong new password for your account.'}
          </p>
        </div>

        <div className="glass border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex gap-2 items-start">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm flex gap-2 items-start">
              <Check size={16} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson" 
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {mode !== 'reset' && (
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
            )}

            {mode === 'reset' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reset Token (from email)</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste the token from your email" 
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F48B29] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {mode !== 'forgot' && mode !== 'reset' && mode !== 'forgot-sent' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setSuccess('');
                        setEmail('');
                      }}
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

            {mode === 'forgot-sent' && (
              <div className="p-6 bg-green-50 rounded-2xl text-center border border-green-100">
                <Mail size={32} className="mx-auto mb-4 text-green-600" />
                <h3 className="font-bold text-slate-800 mb-2">Check your email!</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We've sent a password reset link to <strong>{resetEmail}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  The link will expire in 24 hours. If you don't see the email, check your spam folder.
                </p>
              </div>
            )}

            {mode !== 'forgot-sent' && (
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'admin' ? 'bg-[#1D265A] shadow-slate-200' : 'bg-[#1D265A] hover:bg-[#2A367A] shadow-[#1D265A]/10'} text-white`}
              >
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Get Started' : mode === 'admin' ? 'Authorize Access' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password')}
                {!loading && <ArrowRight size={20} />}
              </button>
            )}
          </form>

          {mode === 'forgot-sent' && (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
                setEmail('');
                setResetEmail('');
              }}
              className="w-full mt-4 font-bold py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Back to Login
            </button>
          )}

          {mode !== 'admin' && mode !== 'forgot' && mode !== 'reset' && mode !== 'forgot-sent' && (
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
              <button onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }} className="text-[#F48B29] font-bold hover:underline">Sign up for free</button>
            </p>
          ) : mode === 'admin' ? (
            <p className="text-slate-500 font-medium">
              Regular student? {' '}
              <button onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }} className="text-[#1D265A] font-bold hover:underline">Student Login</button>
            </p>
          ) : mode !== 'forgot-sent' ? (
            <p className="text-slate-500 font-medium">
              Already have an account? {' '}
              <button onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
                setResetToken('');
                setNewPassword('');
                setConfirmPassword('');
              }} className="text-[#1D265A] font-bold hover:underline">Log in</button>
            </p>
          ) : null}

          {mode !== 'admin' && mode !== 'forgot' && mode !== 'reset' && mode !== 'forgot-sent' && (
            <button 
              onClick={() => {
                setMode('admin');
                setError('');
                setSuccess('');
              }}
              className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1D265A] transition-colors"            >
              — Admin Portal —
            </button>
          )}
        </div>
      </div>
    </div>
  );
};