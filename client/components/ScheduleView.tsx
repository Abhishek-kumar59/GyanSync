
import React from 'react';
import { Timetable } from './Timetable';
import { StudySlot } from '../types';
import { Calendar as CalendarIcon, Filter, Download } from 'lucide-react';

interface ScheduleViewProps {
  slots: StudySlot[];
  onAddSlot: (slot: Omit<StudySlot, 'id'>) => void;
  onDeleteSlot: (id: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ slots, onAddSlot, onDeleteSlot, darkMode }) => {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Full Schedule</h2>
          <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plan your long-term study sessions and exams.</p>
        </div>
        <div className="flex gap-3">
          <button className={`border px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Download size={18} /> Export PDF
          </button>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <CalendarIcon size={18} /> Weekly View
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
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{slots.length * 2} Hours</p>
              </div>
              <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Subjects Planned</p>
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{new Set(slots.map(s => s.subject)).size}</p>
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
            <Timetable slots={slots} onAddSlot={onAddSlot} onDeleteSlot={onDeleteSlot} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};
