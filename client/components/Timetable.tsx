
import React, { useState, useMemo } from 'react';
import { Clock, Plus, Trash2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { StudySlot } from '../types';

interface TimetableProps {
  slots: StudySlot[];
  onAddSlot: (slot: Omit<StudySlot, 'id'>) => void;
  onDeleteSlot: (id: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const Timetable: React.FC<TimetableProps> = ({ slots, onAddSlot, onDeleteSlot, darkMode }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:30');

  // Sort slots by start time for a clean chronological view
  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [slots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim()) {
      onAddSlot({
        subject: newSubject,
        startTime: newStart,
        endTime: newEnd,
        day: 'Today',
        color: ['indigo', 'emerald', 'rose', 'amber', 'purple', 'violet', 'cyan'][Math.floor(Math.random() * 7)]
      });
      setNewSubject('');
      setShowAdd(false);
    }
  };

  return (
    <div className={`rounded-[2rem] border shadow-sm p-8 h-full transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Flexible Study Plan
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Custom</span>
          </h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Tailor your sessions to your college lectures and labs</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
        >
          {showAdd ? 'Close Planner' : <><Plus size={18} /> Add Session</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className={`mb-8 p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200/50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Session Title</label>
              <input 
                type="text" 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. CS201 Lecture"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200'}`}
                required
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Starts At</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="time" 
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Ends At</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="time" 
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setShowAdd(false)} 
              className={`font-bold text-xs uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Confirm Session
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 relative">
        {/* Visual Timeline Line */}
        <div className={`absolute left-[26px] top-4 bottom-4 w-0.5 hidden sm:block ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

        {sortedSlots.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className={`p-4 rounded-full shadow-sm mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
              <CalendarIcon size={32} className={`${darkMode ? 'text-slate-600' : 'text-slate-200'}`} />
            </div>
            <p className="text-sm font-bold text-slate-400">No sessions planned for today</p>
            <button 
              onClick={() => setShowAdd(true)}
              className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Set your first goal
            </button>
          </div>
        ) : (
          sortedSlots.map((slot, idx) => (
            <div key={slot.id} className="flex gap-4 sm:gap-8 group relative animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Timeline Indicator */}
              <div className="hidden sm:flex flex-col items-center z-10">
                <div className={`w-3 h-3 rounded-full border-2 shadow-sm ring-4 ${
                  darkMode ? 'border-slate-800 ring-slate-800/50' : 'border-white ring-slate-50'
                } ${
                  slot.color === 'indigo' ? 'bg-indigo-500' : 
                  slot.color === 'emerald' ? 'bg-emerald-500' : 
                  slot.color === 'rose' ? 'bg-rose-500' :
                  slot.color === 'purple' ? 'bg-purple-500' :
                  slot.color === 'violet' ? 'bg-violet-500' :
                  slot.color === 'cyan' ? 'bg-cyan-500' :
                  'bg-amber-500'
                }`} />
              </div>

              <div className="flex-1 pb-4">
                <div className={`p-6 rounded-[1.5rem] border transition-all hover:shadow-md cursor-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  slot.color === 'indigo' ? (darkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50/30 border-indigo-100') : 
                  slot.color === 'emerald' ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50/30 border-emerald-100') : 
                  slot.color === 'rose' ? (darkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50/30 border-rose-100') :
                  slot.color === 'purple' ? (darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50/30 border-purple-100') :
                  slot.color === 'violet' ? (darkMode ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50/30 border-violet-100') :
                  slot.color === 'cyan' ? (darkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50/30 border-cyan-100') :
                  (darkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50/30 border-amber-100')
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                        slot.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 
                        slot.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                        slot.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                        (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                      }`}>
                        Scheduled
                      </span>
                      <p className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock size={14} className="opacity-40" /> {slot.startTime} — {slot.endTime}
                      </p>
                    </div>
                    <h4 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{slot.subject}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onDeleteSlot(slot.id)}
                      className={`p-2.5 rounded-xl transition-all shadow-sm lg:opacity-0 lg:group-hover:opacity-100 ${darkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-400/10' : 'text-slate-300 hover:text-rose-500 hover:bg-white'}`}
                      title="Delete session"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`mt-8 pt-8 border-t flex items-center gap-3 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className={`p-2 rounded-xl ${darkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-500'}`}>
          <AlertCircle size={18} />
        </div>
        <p className={`text-xs font-medium italic ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Tip: You can enter any specific time for your sessions, making it perfect for varied college class lengths and labs.
        </p>
      </div>
    </div>
  );
};
