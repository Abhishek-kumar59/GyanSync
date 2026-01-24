import React, { useState, useMemo, useEffect } from 'react';
import { Task, StudySlot } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Target, Clock, TrendingUp } from 'lucide-react';
import { authService } from '../services/authService';

interface StatisticsViewProps {
  tasks: Task[];
  streak: number;
  slots: StudySlot[];
  darkMode: boolean;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ tasks, streak, slots, darkMode }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const days = timeRange === 'week' ? 7 : 30;
        const stats = await authService.getStatistics(days);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [timeRange]);

  // Use real data if available
  const completedTasks = statistics?.completedTasks || tasks.filter(t => t.completed).length;
  const totalTasks = statistics?.totalTasks || tasks.length;
  const successRate = statistics?.successRate || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
  const totalStudyHours = statistics?.totalHours || '0.0';
  const chartData = statistics?.chartData || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
          <p className="text-xs font-bold mb-1">{payload[0].payload.displayDate}</p>
          <p className="text-sm font-bold text-indigo-500">
            {payload[0].value} Hours ({payload[0].payload.minutes} mins)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Statistics</h2>
        <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Track your progress and study habits.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Study Streak */}
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame size={80} className={darkMode ? 'text-orange-500' : 'text-orange-500'} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <Flame size={24} fill="currentColor" />
            </div>
            <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{streak}</span>
            <span className={`text-lg font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Days</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={80} className={darkMode ? 'text-emerald-500' : 'text-emerald-500'} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
              <Target size={24} />
            </div>
            <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Success Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{successRate}%</span>
            <span className={`text-lg font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Completion</span>
          </div>
        </div>

        {/* Total Study Hours */}
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} className={darkMode ? 'text-indigo-500' : 'text-indigo-500'} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}>
              <Clock size={24} />
            </div>
            <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Est. Study Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{totalStudyHours}</span>
            <span className={`text-lg font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hours</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp size={20} className="text-indigo-500" /> Study Hour Analysis
            </h3>
            <p className={`text-sm font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Daily study duration over time
            </p>
          </div>
          
          <div className={`flex p-1.5 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'week' 
                ? (darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') 
                : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
              }`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'month' 
                ? (darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') 
                : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
              }`}
            >
              Last Month
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
              <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={timeRange === 'week' ? 40 : 12}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={darkMode ? '#6366f1' : '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};