
import React, { useState } from 'react';
import { Shield, User, Monitor, ChevronRight, Check, X, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdateProfile, darkMode, onToggleDarkMode }) => {
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveGeneral = () => {
    onUpdateProfile({ name, email });
    setIsEditingGeneral(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All fields are required');
        setPasswordLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        setPasswordLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        setPasswordLoading(false);
        return;
      }

      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess('Password changed successfully!');
      
      // Reset form
      setTimeout(() => {
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className={`text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your account preferences and application theme</p>
      </header>
      
      <div className="space-y-6">
        <SettingSection title="General" icon={<User size={18} />} darkMode={darkMode}>
          {isEditingGeneral ? (
            <div className={`p-6 space-y-4 animate-in fade-in duration-200 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSaveGeneral}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Check size={14} /> Save Changes
                </button>
                <button 
                  onClick={() => setIsEditingGeneral(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <SettingItem 
              label="Profile Information" 
              sub={`${profile.name} • ${profile.email}`} 
              onClick={() => setIsEditingGeneral(true)}
              darkMode={darkMode}
            />
          )}
        </SettingSection>

        <SettingSection title="Security" icon={<Shield size={18} />} darkMode={darkMode}>
          {isChangingPassword ? (
            <div className={`p-6 space-y-4 animate-in fade-in duration-200 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              {passwordError && (
                <div className={`p-3 rounded-xl text-sm ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'}`}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                  <Check size={16} /> {passwordSuccess}
                </div>
              )}
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} /> {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <SettingItem 
                label="Change Password" 
                sub="Secure your account with a strong password" 
                onClick={() => setIsChangingPassword(true)}
                darkMode={darkMode}
              />
            </>
          )}
          <SettingItem 
            label="Dark Mode" 
            sub={darkMode ? "Deep navy interface enabled" : "Clean light interface enabled"} 
            toggle 
            active={darkMode} 
            onClick={onToggleDarkMode}
            iconOverride={darkMode ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
            darkMode={darkMode}
          />
        </SettingSection>
      </div>
    </div>
  );
};

const SettingSection = ({ title, icon, children, darkMode }: { title: string, icon: React.ReactNode, children: React.ReactNode, darkMode: boolean }) => (
  <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <div className={`px-6 py-4 flex items-center gap-3 transition-colors ${darkMode ? 'bg-slate-700/50 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-100'}`}>
      <div className="text-indigo-600">{icon}</div>
      <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{title}</span>
    </div>
    <div className={`divide-y transition-colors ${darkMode ? 'divide-slate-700' : 'divide-slate-50'}`}>
      {children}
    </div>
  </div>
);

const SettingItem = ({ label, sub, toggle = false, active = false, onClick, iconOverride, darkMode }: { label: string, sub: string, toggle?: boolean, active?: boolean, onClick?: () => void, iconOverride?: React.ReactNode, darkMode: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-5 transition-colors group ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
  >
    <div className="flex items-center gap-3">
      {iconOverride && <div>{iconOverride}</div>}
      <div className="text-left">
        <p className={`text-sm font-bold transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`}>{label}</p>
        <p className={`text-xs font-medium transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</p>
      </div>
    </div>
    {toggle ? (
      <div className={`w-12 h-6.5 rounded-full p-1 transition-all ${active ? 'bg-indigo-600' : (darkMode ? 'bg-slate-600' : 'bg-slate-200')}`}>
        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-5.5' : ''}`}></div>
      </div>
    ) : (
      <ChevronRight size={18} className={`transition-colors ${darkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-600'}`} />
    )}
  </button>
);
