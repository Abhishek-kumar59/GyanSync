
import React, { useState } from 'react';
import { Bell, Shield, User, Monitor, Globe, ChevronRight, Check, X, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types';

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

  const handleSaveGeneral = () => {
    onUpdateProfile({ name, email });
    setIsEditingGeneral(false);
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
          <SettingItem label="Language & Region" sub="English (US)" darkMode={darkMode} />
        </SettingSection>

        <SettingSection title="Notifications" icon={<Bell size={18} />} darkMode={darkMode}>
          <SettingItem label="Email Notifications" sub="Get updates on your study streak" toggle active darkMode={darkMode} />
          <SettingItem label="Desktop Notifications" sub="Focus timer alerts" toggle darkMode={darkMode} />
        </SettingSection>

        <SettingSection title="Security" icon={<Shield size={18} />} darkMode={darkMode}>
          <SettingItem label="Change Password" sub="Last updated 3 months ago" darkMode={darkMode} />
          <SettingItem label="Two-Factor Authentication" sub="Enabled via Authenticator app" active darkMode={darkMode} />
        </SettingSection>

        <SettingSection title="App Preferences" icon={<Monitor size={18} />} darkMode={darkMode}>
          <SettingItem 
            label="Dark Mode" 
            sub={darkMode ? "Deep navy interface enabled" : "Clean light interface enabled"} 
            toggle 
            active={darkMode} 
            onClick={onToggleDarkMode}
            iconOverride={darkMode ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
            darkMode={darkMode}
          />
          <SettingItem label="Accessibility" sub="High contrast & font sizing" darkMode={darkMode} />
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
