
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DailyGoal } from './components/DailyGoal';
import { TaskSection } from './components/TaskSection';
import { Timetable } from './components/Timetable';
import { ChatOverlay } from './components/ChatOverlay';
import { SubjectFiles } from './components/SubjectFiles';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { LogoutModal } from './components/LogoutModal';
import { MyTasksView } from './components/MyTasksView';
import { ScheduleView } from './components/ScheduleView';
import { StatisticsView } from './components/StatisticsView';
import { AdminDashboard } from './components/AdminDashboard';
import { authService, User } from './services/authService';
import { Task, StudySlot, Folder, UserProfile, Student, FileAsset } from './types';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete Calculus III Assignment', completed: false, priority: 'high', category: 'Math' },
  { id: '2', title: 'Research Neural Networks', completed: true, priority: 'medium', category: 'CS' },
  { id: '3', title: 'Read Literature Review', completed: false, priority: 'low', category: 'English' },
];

const INITIAL_SLOTS: StudySlot[] = [
  { id: '1', day: 'Today', startTime: '08:00', endTime: '10:00', subject: 'Mathematics', color: 'indigo' },
  { id: '2', day: 'Today', startTime: '12:00', endTime: '14:00', subject: 'Organic Chemistry', color: 'emerald' },
];

const INITIAL_FOLDERS: Folder[] = [
  { 
    id: 'f1', 
    name: 'Mathematics', 
    files: [
      { id: 'file1', name: 'Calc_Syllabus.pdf', type: 'pdf', size: '1.2 MB', date: 'Oct 24' },
      { id: 'file2', name: 'Derivatives_Notes.docx', type: 'docx', size: '450 KB', date: 'Oct 28' }
    ] 
  },
  { id: 'f2', name: 'Physics', files: [] }
];

const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.j@university.edu',
  avatar: 'https://picsum.photos/seed/student/150/150',
  banner: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
  major: 'Computer Science',
  location: 'San Francisco, CA',
  streak: 21,
  bio: 'Computer Science student passionate about AI and distributed systems. I love optimizing my study flow and tackling complex algorithms during my late-night coding sessions.'
};

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Johnson', email: 'alex.j@university.edu', avatar: 'https://picsum.photos/seed/student/150/150', banner: '', major: 'Computer Science', location: 'San Francisco', streak: 21, bio: '...', passwordHash: '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.9yN2', joinDate: '2024-10-15', status: 'active' },
  { id: 's2', name: 'Sarah Miller', email: 'sarah.m@college.edu', avatar: 'https://picsum.photos/seed/sarah/150/150', banner: '', major: 'Biochemistry', location: 'Boston', streak: 15, bio: '...', passwordHash: '$2a$12$K8j/aIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.2xK5', joinDate: '2024-11-02', status: 'active' },
  { id: 's3', name: 'Michael Chen', email: 'm.chen@tech.edu', avatar: 'https://picsum.photos/seed/michael/150/150', banner: '', major: 'Electrical Engineering', location: 'Seattle', streak: 45, bio: '...', passwordHash: '$2a$12$L7p/zIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.5mP3', joinDate: '2024-09-20', status: 'active' },
];

export type AppView = 'dashboard' | 'profile' | 'settings' | 'tasks' | 'schedule' | 'statistics' | 'admin';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [slots, setSlots] = useState<StudySlot[]>(() => {
    const saved = localStorage.getItem('slots');
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('isAuth', isAuthenticated.toString());
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setIsAdmin(user.isAdmin);
          setCurrentView(user.isAdmin ? 'admin' : 'dashboard');
          // Set userProfile from user data
          setUserProfile({
            name: user.name,
            email: user.email,
            avatar: user.avatar || 'https://picsum.photos/seed/' + user.name.toLowerCase().replace(' ', '') + '/150/150',
            banner: user.banner || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
            major: user.major || 'Computer Science',
            location: user.location || 'Unknown',
            streak: user.streak || 0,
            bio: user.bio || 'Welcome to GyanSync! Update your profile to tell others about yourself.'
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleLogin = (user: User, asAdmin: boolean = false) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setIsAdmin(user.isAdmin);
    setCurrentView(user.isAdmin ? 'admin' : 'dashboard');
    // Set userProfile from user data
    setUserProfile({
      name: user.name,
      email: user.email,
      avatar: user.avatar || 'https://picsum.photos/seed/' + user.name.toLowerCase().replace(' ', '') + '/150/150',
      banner: user.banner || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
      major: user.major || 'Computer Science',
      location: user.location || 'Unknown',
      streak: user.streak || 0,
      bio: user.bio || 'Welcome to GyanSync! Update your profile to tell others about yourself.'
    });
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setShowLogoutModal(false);
    setCurrentView('dashboard');
  };

  const handleAddTask = (title: string, priority: Task['priority'], category: string = 'General') => {
    const newTask: Task = { id: Date.now().toString(), title, completed: false, priority, category };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAddSlot = (newSlot: Omit<StudySlot, 'id'>) => {
    const slot: StudySlot = { ...newSlot, id: Date.now().toString() };
    setSlots(prev => [...prev, slot]);
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleAddFolder = (name: string) => {
    const folder: Folder = { id: Date.now().toString(), name, files: [] };
    setFolders(prev => [...prev, folder]);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
  };

  const handleAddFile = (folderId: string, name: string) => {
    const newFile: FileAsset = {
      id: Date.now().toString(),
      name,
      type: name.split('.').pop() || 'file',
      size: '2.5 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, files: [...f.files, newFile] } : f));
  };

  const handleDeleteFile = (folderId: string, fileId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, files: f.files.filter(file => file.id !== fileId) } : f));
  };

  // Student Management (Admin)
  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <Header 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
        onNavigate={setCurrentView}
        onLogoutClick={() => setShowLogoutModal(true)}
        userProfile={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: 'https://picsum.photos/seed/' + currentUser.name.toLowerCase().replace(' ', '') + '/150/150',
          banner: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
          major: 'Computer Science',
          location: 'Unknown',
          streak: 0,
          bio: ''
        } : INITIAL_USER_PROFILE}
        darkMode={darkMode}
        isAdmin={isAdmin}
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[55] lg:hidden animate-in fade-in duration-300">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className={`absolute left-0 top-0 bottom-0 w-80 shadow-2xl animate-in slide-in-from-left duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <span className={`font-bold uppercase tracking-widest text-xs ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-rose-500">
                  <X size={20} />
                </button>
              </div>
              {!isAdmin && (
                <Sidebar 
                  onChatToggle={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }} 
                  streak={userProfile.streak} 
                  isMobile 
                  currentView={currentView}
                  onNavigate={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }}
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <Sidebar 
            onChatToggle={() => setIsChatOpen(!isChatOpen)} 
            streak={userProfile.streak} 
            currentView={currentView}
            onNavigate={setCurrentView}
            darkMode={darkMode}
          />
        )}
        
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
          {currentView === 'dashboard' && (
            <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
              <header>
                <div className="flex items-center gap-3 text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2">
                  <span>Education</span>
                  <span className="opacity-30">/</span>
                  <span className={`${darkMode ? 'text-indigo-400' : 'text-slate-800'}`}>Student Hub</span>
                </div>
                <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Focus on, {userProfile.name.split(' ')[0]}!</h2>
                <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium">
                  You've completed <span className="text-indigo-600 font-bold">{completedCount} tasks</span> so far. Keep the momentum!
                </p>
              </header>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
                <div className="xl:col-span-4 space-y-6 md:space-y-10">
                  <DailyGoal completed={completedCount} total={tasks.length} darkMode={darkMode} />
                  <div className="h-[500px]">
                    <TaskSection 
                      tasks={tasks} 
                      onAddTask={handleAddTask} 
                      onToggleTask={handleToggleTask}
                      onDeleteTask={handleDeleteTask}
                      darkMode={darkMode}
                    />
                  </div>
                </div>

                <div className="xl:col-span-8 flex flex-col gap-6 md:gap-10">
                  <Timetable 
                    slots={slots} 
                    onAddSlot={handleAddSlot}
                    onDeleteSlot={handleDeleteSlot}
                    darkMode={darkMode}
                  />
                  
                  <SubjectFiles 
                    folders={folders}
                    onAddFolder={handleAddFolder}
                    onAddFile={handleAddFile}
                    onDeleteFolder={handleDeleteFolder}
                    onDeleteFile={handleDeleteFile}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          )}

          {currentView === 'admin' && isAdmin && (
            <AdminDashboard 
              students={students} 
              onAddStudent={handleAddStudent} 
              onDeleteStudent={handleDeleteStudent} 
              darkMode={darkMode} 
            />
          )}

          {currentView === 'tasks' && (
            <MyTasksView 
              tasks={tasks} 
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              darkMode={darkMode}
            />
          )}

          {currentView === 'schedule' && (
            <ScheduleView 
              slots={slots}
              onAddSlot={handleAddSlot}
              onDeleteSlot={handleDeleteSlot}
              darkMode={darkMode}
            />
          )}

          {currentView === 'statistics' && (
            <StatisticsView 
              tasks={tasks}
              streak={userProfile.streak}
              darkMode={darkMode}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView profile={userProfile} onUpdateProfile={handleUpdateProfile} darkMode={darkMode} />
          )}

          {currentView === 'settings' && (
            <SettingsView 
              profile={userProfile} 
              onUpdateProfile={handleUpdateProfile}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}
        </main>
      </div>

      {!isAdmin && <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} darkMode={darkMode} />}
      
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={handleLogout} 
          onCancel={() => setShowLogoutModal(false)} 
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default App;
