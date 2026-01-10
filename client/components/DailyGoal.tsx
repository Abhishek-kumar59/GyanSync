
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface DailyGoalProps {
  completed: number;
  total: number;
  darkMode: boolean;
}

export const DailyGoal: React.FC<DailyGoalProps> = ({ completed, total, darkMode }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const data = [
    {
      name: 'Progress',
      value: percentage,
      fill: '#4f46e5',
    }
  ];

  return (
    <div className={`p-8 rounded-[2rem] border shadow-sm flex flex-col items-center transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Daily Progress</h3>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Live</span>
      </div>
      
      <div className="h-48 w-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="100%" 
            barSize={16} 
            data={data} 
            startAngle={90} 
            endAngle={450}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: darkMode ? '#1E293B' : '#F1F5F9' }}
              dataKey="value"
              cornerRadius={12}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{percentage}%</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Goal</span>
        </div>
      </div>
      
      <div className="mt-8 w-full space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">Tasks Completed</span>
          <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{completed} / {total}</span>
        </div>
        <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <div 
            className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
