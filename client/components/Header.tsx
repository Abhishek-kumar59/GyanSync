
import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, Bell, Menu, X, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onNavigate: (view: any) => void;
  onLogoutClick: () => void;
  userProfile: UserProfile;
  darkMode: boolean;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen, onNavigate, onLogoutClick, userProfile, darkMode, isAdmin }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-[60] border-b px-4 md:px-6 py-4 flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700 backdrop-blur-md' : 'glass border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={onMobileMenuToggle}
          className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')}
        >
          <div className="bg-white p-1 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
            <img src="./logo.png" alt="GyanSync Logo" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex">
            <span className={darkMode ? "text-slate-100" : "text-[#1D265A]"}>Gyan</span>
            <span className="text-[#F48B29]">Sync</span>
          </h1>
          {isAdmin && (
            <span className="ml-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest hidden sm:inline-block">Admin Portal</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button className={`relative p-2 transition-colors hidden sm:block ${darkMode ? 'text-slate-400 hover:text-[#F48B29]' : 'text-slate-500 hover:text-[#F48B29]'}`}>
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 md:gap-3 p-1 rounded-full transition-colors border border-transparent ${darkMode ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-slate-100 hover:border-slate-200'}`}
          >
            <img 
              src={isAdmin ? 'https://picsum.photos/seed/admin/150/150' : userProfile.avatar} 
              alt="Avatar" 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shadow-sm ring-2 ring-[#F48B29]/20"
            />
            <div className="hidden md:block text-left">
              <p className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{isAdmin ? 'System Admin' : userProfile.name}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                {isAdmin ? 'Full Authority' : 'Pro Learner'}
              </p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)} />
              <div className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-10 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="p-2">
                  {!isAdmin ? (
                    <>
                      <button 
                        onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <User size={18} className="text-slate-400" />
                        View Profile
                      </button>
                      <button 
                        onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Settings size={18} className="text-slate-400" />
                        Account Settings
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <ShieldCheck size={18} className="text-indigo-400" />
                      Dashboard
                    </button>
                  )}
                  <hr className={`my-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
                  <button 
                    onClick={() => { onLogoutClick(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
