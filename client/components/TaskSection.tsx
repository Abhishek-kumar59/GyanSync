
import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Filter, AlertCircle, Tag, X, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface TaskSectionProps {
  tasks: Task[];
  onAddTask: (title: string, priority: Task['priority'], category: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

interface ConfirmDeleteModalProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  // Added darkMode prop for consistency
  darkMode: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ taskTitle, onConfirm, onCancel, darkMode }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-3xl text-amber-500 mb-6 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Delete Task?</h3>
        <p className={`text-sm font-medium mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to delete "<span className="font-bold">{taskTitle}</span>"?</p>
        <div className="flex w-full gap-3">
          <button onClick={onCancel} className={`flex-1 font-bold py-3 rounded-2xl transition-all ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-rose-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">Delete</button>
        </div>
      </div>
    </div>
  </div>
);

const CATEGORIES = ['General', 'Math', 'CS', 'English', 'Science', 'Exam', 'Research'];

export const TaskSection: React.FC<TaskSectionProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, darkMode }) => {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState('General');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle, priority, category);
      setNewTitle('');
    }
  };

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'All') return tasks;
    return tasks.filter(t => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  return (
    <div className={`rounded-[2rem] border shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className="flex flex-col">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Study Tasks
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{filteredTasks.length}</span>
          </h2>
          {selectedCategory !== 'All' && (
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Filtering by: {selectedCategory}</span>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`p-2 rounded-xl transition-all ${showFilterMenu ? (darkMode ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Filter size={18} />
          </button>
          
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
              <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { setSelectedCategory('All'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${selectedCategory === 'All' ? (darkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')}`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${selectedCategory === cat ? (darkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`p-6 border-b space-y-3 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-50 bg-slate-50/50'}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new study task..."
              className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200'}`}
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Priority:</span>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black transition-all border ${
                      priority === p 
                      ? (p === 'high' ? (darkMode ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-rose-100 border-rose-200 text-rose-600') : p === 'medium' ? (darkMode ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-200 text-amber-600') : (darkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-600'))
                      : (darkMode ? 'bg-slate-700 border-slate-600 text-slate-500' : 'bg-white border-slate-100 text-slate-400')
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Category:</span>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`border rounded-lg px-2 py-0.5 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400/50">
            <AlertCircle size={32} strokeWidth={1.5} className="mb-2" />
            <p className="text-sm font-medium">No tasks found here!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${task.completed ? (darkMode ? 'bg-slate-700/30 border-slate-700/50 opacity-50' : 'bg-slate-50 border-slate-50 opacity-60') : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm')}`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`transition-all ${task.completed ? 'text-emerald-500' : (darkMode ? 'text-slate-600 hover:text-indigo-400' : 'text-slate-200 hover:text-indigo-400')}`}
                >
                  {task.completed ? <CheckCircle2 size={22} fill="currentColor" className="text-white bg-emerald-500 rounded-full" /> : <Circle size={22} />}
                </button>
                <div>
                  <p className={`text-sm font-semibold ${task.completed ? (darkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through font-normal') : (darkMode ? 'text-slate-200' : 'text-slate-700')}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-2 items-center mt-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      • {task.priority}
                    </span>
                    <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-300'}`}>
                      <Tag size={8} /> {task.category}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setTaskToDelete(task)}
                className={`p-1.5 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100 ${darkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-400/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {taskToDelete && (
        <ConfirmDeleteModal 
          taskTitle={taskToDelete.title}
          onConfirm={() => { onDeleteTask(taskToDelete.id); setTaskToDelete(null); }}
          onCancel={() => setTaskToDelete(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
