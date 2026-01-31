
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, TrendingUp, UserPlus, Trash2, Search, 
  ShieldCheck, Calendar, Eye, EyeOff, AlertTriangle, X,
  Shield, ShieldAlert 
} from 'lucide-react';
import { Student } from '../types';
import { authService } from '../services/authService';

interface AdminDashboardProps {
  students: Student[];
  onAddStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  darkMode: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, onAddStudent, onDeleteStudent, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    growth: '+0%',
    avgStreak: 0
  });
  const [activeNow, setActiveNow] = useState(0);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getAdminStatistics();
        setStats({
          total: data.totalStudents,
          active: data.activeStudents,
          growth: data.growthRate,
          avgStreak: data.avgStreak
        });
        setGrowthData(data.monthlyData || []);
      } catch (error) {
        console.error('Failed to fetch admin statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [students.length]); // Refetch when students change

  // Fetch active users count every 10 seconds
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const data = await authService.getActiveUsers();
        setActiveNow(data.activeNow);
      } catch (error) {
        console.error('Failed to fetch active users:', error);
      }
    };

    // Fetch immediately
    fetchActiveUsers();

    // Set up interval to refresh every 10 seconds
    const interval = setInterval(fetchActiveUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const { calculatedGrowthRate, chartData, availableYears } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Growth Rate (Month over Month)
    const thisMonthCount = students.filter(s => {
      const d = new Date(s.joinDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthCount = students.filter(s => {
      const d = new Date(s.joinDate);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    let rate = 0;
    if (lastMonthCount === 0) {
      rate = thisMonthCount > 0 ? 100 : 0;
    } else {
      rate = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }
    const formattedRate = (rate > 0 ? '+' : '') + rate.toFixed(1) + '%';

    // 2. Chart Data
    const uniqueYears = new Set(students.map(s => new Date(s.joinDate).getFullYear()));
    uniqueYears.add(currentYear);
    const years = Array.from(uniqueYears).sort((a, b) => b - a);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, index) => {
      const count = students.filter(s => {
        const d = new Date(s.joinDate);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      }).length;
      return { name: month, users: count };
    });

    return { calculatedGrowthRate: formattedRate, chartData: data, availableYears: years };
  }, [students, selectedYear]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-[#F48B29] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Shield size={14} /> GyanSync Administration
          </div>
          <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>System Overview</h2>
          <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor GyanSync user base and student engagement.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1D265A] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2A367A] transition-all shadow-xl shadow-[#1D265A]/20 active:scale-95"
        >
          <UserPlus size={20} /> Register Student
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Total Students" value={stats.total} trend={stats.growth} icon={<Users className="text-[#1D265A]" />} darkMode={darkMode} />
        <AdminStatCard label="Active Now" value={activeNow} trend="Real-time" icon={<ShieldCheck className="text-emerald-500" />} darkMode={darkMode} />
        <AdminStatCard label="Avg. Study Streak" value={`${stats.avgStreak} Days`} trend="Top 10%" icon={<TrendingUp className="text-[#F48B29]" />} darkMode={darkMode} />
        <AdminStatCard label="Growth Rate" value={calculatedGrowthRate} trend="Monthly" icon={<ShieldAlert className="text-rose-500" />} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>User Base Growth</h3>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`p-2 rounded-xl text-xs font-bold outline-none cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year} Performance</option>
              ))}
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: darkMode ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: darkMode ? '#0f172a' : '#fff' }} 
                />
                <Bar dataKey="users" fill="#F48B29" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`lg:col-span-4 p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="p-2 rounded-[1.5rem] bg-white shadow-lg mb-6">
            <img src="/logo.png" alt="GyanSync Admin" className="w-16 h-16 object-contain" />
          </div>
          <h3 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>Data Security</h3>
          <p className="text-slate-500 text-sm font-medium mb-8">All GyanSync passwords are SHA-256 encrypted. Private information is handled with zero-knowledge protocols.</p>
          <div className="w-full bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 text-left overflow-hidden">
            <div className="flex gap-2 mb-1"><span className="opacity-30">ENCRYPTING:</span> <span>$2a$12$R9h/cIPz...</span></div>
            <div className="flex gap-2"><span className="opacity-30">STATUS:</span> <span className="animate-pulse">GYANSYNC SECURE</span></div>
          </div>
        </div>
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-50 bg-slate-50'}`}>
          <div>
            <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>GyanSync Student Directory</h3>
            <p className="text-slate-400 text-sm font-medium">Detailed access to all registered user records on the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#F48B29] transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-widest text-slate-400 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Details</th>
                <th className="px-8 py-5">Security</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-50'}`}>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-slate-500/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
                      <div>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>{student.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{student.major}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Sync Date {student.joinDate}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono text-[10px] flex-1 max-w-[150px] overflow-hidden truncate ${darkMode ? 'bg-slate-900 text-orange-400 border border-slate-700' : 'bg-slate-100 text-[#F48B29] border border-slate-200'}`}>
                        {showPasswords[student.id] ? student.passwordHash : '••••••••••••••••'}
                      </div>
                      <button 
                        onClick={() => togglePassword(student.id)}
                        className={`p-2 rounded-xl transition-all ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        {showPasswords[student.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setConfirmDelete(student.id)}
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <Search size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold">No GyanSync users matched your search.</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <RegisterStudentModal 
          onClose={() => setShowAddModal(false)} 
          onSave={onAddStudent} 
          darkMode={darkMode} 
        />
      )}

      {confirmDelete && (
        <AdminConfirmationModal 
          title="Remove GyanSync User?"
          message="This will permanently remove the student and all their synced data from GyanSync. This action cannot be undone."
          onConfirm={() => { onDeleteStudent(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

const AdminStatCard = ({ label, value, trend, icon, darkMode }: { label: string, value: string | number, trend: string, icon: React.ReactNode, darkMode: boolean }) => (
  <div className={`p-6 rounded-[2rem] border shadow-sm transition-all hover:translate-y-[-4px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>{icon}</div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">{trend}</span>
    </div>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-3xl font-black leading-tight ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>{value}</p>
    </div>
  </div>
);

const AdminConfirmationModal = ({ title, message, onConfirm, onCancel, darkMode }: any) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-3xl text-rose-500 mb-6 ${darkMode ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>{title}</h3>
        <p className={`text-sm font-medium mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
        <div className="flex w-full gap-3">
          <button onClick={onCancel} className={`flex-1 font-bold py-4 rounded-2xl transition-all ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all">Remove</button>
        </div>
      </div>
    </div>
  </div>
);

const RegisterStudentModal = ({ onClose, onSave, darkMode }: any) => {
  const [data, setData] = useState({ name: '', email: '', major: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend API to register student
      const newUser = await authService.registerStudent(data.name, data.email, data.password, data.major);
      
      // Convert to Student format for display
      const newStudent: Student = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || `https://picsum.photos/seed/${newUser.name.split(' ')[0]}/150/150`,
        banner: newUser.banner || '',
        major: newUser.major,
        location: newUser.location || 'Not Set',
        streak: newUser.streak || 0,
        bio: newUser.bio || 'Welcome to GyanSync!',
        passwordHash: 'hashed', // Don't display real hash
        joinDate: newUser.joinDate || new Date().toISOString().split('T')[0],
        status: 'active'
      };

      onSave(newStudent);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register student. Email may already be in use.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl transition-colors ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#1D265A]'}`}>Register GyanSync Student</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400" disabled={isLoading}><X size={24} /></button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500 rounded-xl text-rose-500 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input 
              required
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-[#F48B29] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} disabled:opacity-50`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Email</label>
            <input 
              required 
              type="email"
              value={data.email} 
              onChange={e => setData({...data, email: e.target.value})}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-[#F48B29] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} disabled:opacity-50`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Major / Course</label>
            <input 
              required
              value={data.major} 
              onChange={e => setData({...data, major: e.target.value})}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-[#F48B29] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} disabled:opacity-50`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporary Password</label>
            <input 
              required 
              type="password"
              value={data.password} 
              onChange={e => setData({...data, password: e.target.value})}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-[#F48B29] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} disabled:opacity-50`}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1D265A] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#1D265A]/20 hover:bg-[#2A367A] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Registering...
              </>
            ) : (
              'Add to GyanSync'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
