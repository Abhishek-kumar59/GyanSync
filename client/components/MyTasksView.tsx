
import React, { useState } from 'react';
import { TaskSection } from './TaskSection';
import { Task } from '../types';
import { Search, Filter, Calendar, CheckSquare, List } from 'lucide-react';

interface MyTasksViewProps {
  tasks: Task[];
  // Updated signature to match App.tsx and fix Type error
  onAddTask: (title: string, priority: Task['priority'], category: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, darkMode }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Tasks</h2>
        <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Detailed view of all your study objectives.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-[2rem] border shadow-sm space-y-4 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest px-2 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>Quick Filters</h3>
            <div className="space-y-1">
              <FilterButton 
                icon={<List size={18} />} 
                label="All Tasks" 
                count={tasks.length} 
                active={filter === 'all'} 
                onClick={() => setFilter('all')} 
                darkMode={darkMode}
              />
              <FilterButton 
                icon={<Calendar size={18} />} 
                label="Pending" 
                count={tasks.filter(t => !t.completed).length} 
                active={filter === 'pending'} 
                onClick={() => setFilter('pending')} 
                darkMode={darkMode}
              />
              <FilterButton 
                icon={<CheckSquare size={18} />} 
                label="Completed" 
                count={tasks.filter(t => t.completed).length} 
                active={filter === 'completed'} 
                onClick={() => setFilter('completed')} 
                darkMode={darkMode}
              />
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
            <h4 className="text-xl font-bold mb-2">Power Session</h4>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6 opacity-80">Try to complete at least 3 high priority tasks today!</p>
            <button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-2xl text-sm font-bold transition-all backdrop-blur-md">
              Start Session
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 h-[700px]">
          <TaskSection 
            tasks={filteredTasks} 
            onAddTask={onAddTask} 
            onToggleTask={onToggleTask} 
            onDeleteTask={onDeleteTask} 
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ icon, label, count, active, onClick, darkMode }: { icon: React.ReactNode, label: string, count: number, active: boolean, onClick: () => void, darkMode: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
      active 
      ? (darkMode ? 'bg-indigo-600 text-white font-bold' : 'bg-indigo-50 text-indigo-600 font-bold') 
      : (darkMode ? 'text-slate-400 hover:bg-slate-700/50 font-medium' : 'text-slate-500 hover:bg-slate-50 font-medium')
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? (darkMode ? 'bg-indigo-500' : 'bg-indigo-100') : (darkMode ? 'bg-slate-700' : 'bg-slate-100')}`}>
      {count}
    </span>
  </button>
);
