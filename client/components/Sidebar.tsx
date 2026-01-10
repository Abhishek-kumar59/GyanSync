
import React, { useState, useEffect, useRef } from 'react';
import { AlarmClock, Flame, MessageSquare, LayoutGrid, ListTodo, Calendar, Timer, Play, Square, RotateCcw, Edit2, Check } from 'lucide-react';
import { AppView } from '../App';

interface SidebarProps {
  onChatToggle: () => void;
  streak: number;
  isMobile?: boolean;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  darkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onChatToggle, streak, isMobile = false, currentView, onNavigate, darkMode }) => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('25');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(parseInt(editMinutes) * 60);
  };

  const handleTimerSave = () => {
    const mins = parseInt(editMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
      setTimeLeft(mins * 60);
      setIsEditing(false);
    }
  };

  const content = (
    <div className={`flex flex-col gap-8 h-full ${isMobile ? 'p-6' : ''}`}>
      <nav className="flex flex-col gap-1">
        <NavItem 
          icon={<LayoutGrid size={20} />} 
          label="Dashboard" 
          active={currentView === 'dashboard'} 
          onClick={() => onNavigate('dashboard')}
          darkMode={darkMode}
        />
        <NavItem 
          icon={<ListTodo size={20} />} 
          label="My Tasks" 
          active={currentView === 'tasks'} 
          onClick={() => onNavigate('tasks')}
          darkMode={darkMode}
        />
        <NavItem 
          icon={<Calendar size={20} />} 
          label="Schedule" 
          active={currentView === 'schedule'} 
          onClick={() => onNavigate('schedule')}
          darkMode={darkMode}
        />
        <NavItem 
          icon={<Timer size={20} />} 
          label="Statistics" 
          active={currentView === 'statistics'} 
          onClick={() => onNavigate('statistics')}
          darkMode={darkMode}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-rose-500 p-6 rounded-[2rem] text-white shadow-xl shadow-orange-500/10">
          <div className="flex items-center justify-between mb-2">
            <Flame size={20} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Study Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{streak}</span>
            <span className="text-sm font-bold opacity-90">Days</span>
          </div>
        </div>

        <div className={`p-5 rounded-[2rem] border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <AlarmClock size={16} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Focus Timer</span>
            </div>
            {!isActive && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {isEditing ? <Check size={14} onClick={handleTimerSave} /> : <Edit2 size={14} />}
              </button>
            )}
          </div>
          
          <div className="text-center mb-4">
            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <input 
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className={`w-16 border rounded-lg text-center font-mono text-2xl font-bold outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-600'}`}
                  autoFocus
                />
                <span className="text-slate-400 font-bold">MIN</span>
              </div>
            ) : (
              <span className={`text-4xl font-mono font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isActive ? (
              <button 
                onClick={() => { setIsEditing(false); setIsActive(true); }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Play size={14} fill="currentColor" /> Start
              </button>
            ) : (
              <button 
                onClick={() => setIsActive(false)}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-white'}`}
              >
                <Square size={14} fill="currentColor" /> Stop
              </button>
            )}
            <button 
              onClick={resetTimer}
              className={`p-3 rounded-2xl transition-all ${darkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <button 
          onClick={onChatToggle}
          className="group flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-indigo-600 text-white py-4.5 rounded-[2rem] transition-all shadow-2xl hover:-translate-y-1"
        >
          <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold">Ask Assistant</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) return content;

  return (
    <aside className={`w-72 border-r h-[calc(100vh-80px)] sticky top-20 p-6 flex flex-col hidden lg:flex transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      {content}
    </aside>
  );
};

const NavItem = ({ icon, label, active = false, onClick, darkMode }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, darkMode: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-4 rounded-2xl transition-all ${
      active 
      ? (darkMode ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' : 'bg-indigo-50 text-indigo-600 font-bold shadow-sm') 
      : (darkMode ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium')
    }`}
  >
    <div className={active ? 'text-white' : (darkMode ? 'text-slate-500' : 'text-slate-400')}>{icon}</div>
    <span>{label}</span>
  </button>
);
