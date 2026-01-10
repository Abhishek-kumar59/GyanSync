
import React from 'react';
import { Task } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Award, Target, Flame, CheckCircle, Clock } from 'lucide-react';

interface StatisticsViewProps {
  tasks: Task[];
  streak: number;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ tasks, streak, darkMode }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  const pieData = [
    { name: 'Completed', value: completedCount, color: '#4f46e5' },
    { name: 'Pending', value: pendingCount, color: darkMode ? '#1E293B' : '#f1f5f9' },
  ];

  const studyData = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 8 },
    { day: 'Fri', hours: 3 },
    { day: 'Sat', hours: 7 },
    { day: 'Sun', hours: 5 },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Statistics</h2>
        <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your progress and study performance data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Flame className="text-orange-500" />} label="Current Streak" value={`${streak} Days`} darkMode={darkMode} />
        <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Tasks Done" value={completedCount} darkMode={darkMode} />
        <StatCard icon={<Clock className="text-indigo-500" />} label="Study Time" value="38h 20m" darkMode={darkMode} />
        <StatCard icon={<Target className="text-rose-500" />} label="Success Rate" value={`${Math.round((completedCount/Math.max(tasks.length,1))*100)}%`} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 p-8 rounded-[2.5rem] border shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Study Hours Analysis</h3>
            <select className={`border-none rounded-xl text-xs font-bold px-4 py-2 outline-none ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                    color: darkMode ? '#F1F5F9' : '#1E293B'
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`lg:col-span-4 p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-bold w-full mb-8 text-left ${darkMode ? 'text-white' : 'text-slate-800'}`}>Task Completion</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{completedCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Solved</span>
            </div>
          </div>
          <div className="mt-6 w-full space-y-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, darkMode }: { icon: React.ReactNode, label: string, value: string | number, darkMode: boolean }) => (
  <div className={`p-6 rounded-[2rem] border shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-md flex items-center gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <div className={`p-4 rounded-2xl transition-colors ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-2xl font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
    </div>
  </div>
);
