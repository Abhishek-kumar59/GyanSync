
import React, { useState } from 'react';
import { Timetable } from './Timetable';
import { StudySlot } from '../types';
import { Calendar as CalendarIcon, Filter, List, Clock, Plus, X, Check } from 'lucide-react';

interface ScheduleViewProps {
  slots: StudySlot[];
  onAddSlot: (slot: Omit<StudySlot, 'id'>) => void;
  onDeleteSlot: (id: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ slots, onAddSlot, onDeleteSlot, darkMode }) => {
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    startTime: '09:00',
    endTime: '10:00',
    day: 'Monday',
    isRecurring: false
  });

  // Helper function to calculate duration in hours between two times
  const calculateDuration = (startTime: string, endTime: string): number => {
    let [startHour, startMin] = startTime.split(':').map(Number);
    let [endHour, endMin] = endTime.split(':').map(Number);
    if (endHour < startHour) {
      endHour += 12; // Assume PM if end hour is less than start hour
    }
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;
    return Math.max(0, diffMinutes / 60); // Ensure non-negative duration
  };

  // Calculate total study hours
  const totalStudyHours = slots.reduce((total, slot) => total + calculateDuration(slot.startTime, slot.endTime), 0);

  // Calculate daily average (total hours / 7 days)
  const dailyAverage = totalStudyHours / 7;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'violet', 'cyan'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    if (formData.isRecurring) {
      days.forEach(d => {
        onAddSlot({
          subject: formData.subject,
          startTime: formData.startTime,
          endTime: formData.endTime,
          day: d,
          color: randomColor
        });
      });
    } else {
      onAddSlot({
        subject: formData.subject,
        startTime: formData.startTime,
        endTime: formData.endTime,
        day: formData.day,
        color: randomColor
      });
    }
    setShowAddForm(false);
    setFormData({ ...formData, subject: '' });
  };



  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Full Schedule</h2>
          <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plan your long-term study sessions and exams.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'week' : 'list')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            {viewMode === 'list' ? <><CalendarIcon size={18} /> Weekly View</> : <><List size={18} /> List View</>}
          </button>
        </div>
      </header>

      <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[600px] transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          <div className={`lg:col-span-3 p-8 border-r transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>Schedule Overview</h3>
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Study Hours</p>
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{totalStudyHours.toFixed(1)} Hours</p>
              </div>
              <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Subjects Planned</p>
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{new Set(slots.map(s => s.subject)).size}</p>
              </div>
              <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Daily Average</p>
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{dailyAverage.toFixed(1)} Hours</p>
              </div>
              
              <div className={`pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Upcoming Next</h4>
                <div className="space-y-3">
                  {slots.slice(0, 3).map((slot, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        slot.color === 'indigo' ? 'bg-indigo-500' : 
                        slot.color === 'emerald' ? 'bg-emerald-500' : 
                        slot.color === 'rose' ? 'bg-rose-500' :
                        slot.color === 'purple' ? 'bg-purple-500' :
                        slot.color === 'violet' ? 'bg-violet-500' :
                        slot.color === 'cyan' ? 'bg-cyan-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{slot.subject}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{slot.startTime}</p>
                      </div>
                    </div>
                  ))}
                  {slots.length === 0 && <p className="text-xs text-slate-400 font-medium">No sessions planned.</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-9 p-8">
            {viewMode === 'list' ? (
              <Timetable slots={slots} onAddSlot={onAddSlot} onDeleteSlot={onDeleteSlot} darkMode={darkMode} />
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Weekly Overview</h3>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {showAddForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Session</>}
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={handleAddSubmit} className={`p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200/50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-2">
                        <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Subject</label>
                        <input 
                          type="text" 
                          required
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                          placeholder="e.g. Physics Lab"
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Day</label>
                        <select 
                          value={formData.day}
                          onChange={e => setFormData({...formData, day: e.target.value})}
                          disabled={formData.isRecurring}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-600 text-white disabled:opacity-50' : 'bg-white border-slate-200 disabled:opacity-50'}`}
                        >
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start</label>
                        <input 
                          type="time" 
                          value={formData.startTime}
                          onChange={e => setFormData({...formData, startTime: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>End</label>
                        <input 
                          type="time" 
                          value={formData.endTime}
                          onChange={e => setFormData({...formData, endTime: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isRecurring ? 'bg-indigo-600 border-indigo-600' : (darkMode ? 'border-slate-500' : 'border-slate-300')}`}>
                          {formData.isRecurring && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} />
                        <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Repeat for entire week</span>
                      </label>
                      <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                        Confirm Schedule
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {days.map(day => {
                    const daySlots = slots.filter(s => s.day === day || (s.day === 'Today' && day === currentDayName));
                    return (
                      <div key={day} className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                        <h4 className={`font-bold mb-4 flex items-center justify-between ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {day}
                          <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-500'}`}>{daySlots.length}</span>
                        </h4>
                        <div className="space-y-3">
                          {daySlots.length > 0 ? daySlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                            <div key={slot.id} className={`p-3 rounded-2xl border text-sm ${
                              slot.color === 'indigo' ? (darkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700') :
                              slot.color === 'emerald' ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700') :
                              slot.color === 'rose' ? (darkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-700') :
                              slot.color === 'amber' ? (darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700') :
                              (darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700')
                            }`}>
                              <div className="font-bold">{slot.subject}</div>
                              <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                                <Clock size={12} /> {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          )) : (
                            <div className={`text-xs text-center py-4 italic ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>No sessions</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
