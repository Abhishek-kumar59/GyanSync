
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
import { Task, StudySlot, Folder, UserProfile, Student } from './types';

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
  joinDate: '2024-10-15',
  streak: 21,
  bio: 'Computer Science student passionate about AI and distributed systems. I love optimizing my study flow and tackling complex algorithms during my late-night coding sessions.'
};

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Johnson', email: 'alex.j@university.edu', avatar: 'https://picsum.photos/seed/student/150/150', banner: '', major: 'Computer Science', location: 'San Francisco', streak: 21, bio: '...', passwordHash: '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.9yN2', joinDate: '2024-10-15', status: 'active' },
  { id: 's2', name: 'Sarah Miller', email: 'sarah.m@college.edu', avatar: 'https://picsum.photos/seed/sarah/150/150', banner: '', major: 'Biochemistry', location: 'Boston', streak: 15, bio: '...', passwordHash: '$2a$12$K8j/aIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.2xK5', joinDate: '2024-11-02', status: 'active' },
  { id: 's3', name: 'Michael Chen', email: 'm.chen@tech.edu', avatar: 'https://picsum.photos/seed/michael/150/150', banner: '', major: 'Electrical Engineering', location: 'Seattle', streak: 45, bio: '...', passwordHash: '$2a$12$L7p/zIPz0gi.URNNX3kh2OPST9/zB6TKV7.o9D5D.1T3H0.5mP3', joinDate: '2024-09-20', status: 'active' },
];

export type AppView = 'dashboard' | 'profile' | 'settings' | 'tasks' | 'schedule' | 'statistics' | 'admin';
export type AuthViewType = 'login' | 'signup' | 'forgot' | 'reset';

// Helper to determine view from URL path
const getViewFromPath = (path: string): AppView => {
  if (path === '/admin') return 'admin';
  if (path === '/profile') return 'profile';
  if (path === '/settings') return 'settings';
  if (path === '/tasks') return 'tasks';
  if (path === '/schedule') return 'schedule';
  if (path === '/statistics') return 'statistics';
  return 'dashboard';
};

const getAuthViewFromPath = (path: string): AuthViewType => {
  if (path === '/signup') return 'signup';
  if (path === '/forgot') return 'forgot';
  if (path.startsWith('/reset')) return 'reset';
  return 'login';
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(() => getViewFromPath(window.location.pathname));
  const [currentAuthView, setCurrentAuthView] = useState<AuthViewType>(() => getAuthViewFromPath(window.location.pathname));
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [slots, setSlots] = useState<StudySlot[]>([]);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

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

  // Sync URL with currentView
  useEffect(() => {
    if (isAuthenticated) {
      const pathMap: Record<AppView, string> = {
        dashboard: '/',
        admin: '/admin',
        profile: '/profile',
        settings: '/settings',
        tasks: '/tasks',
        schedule: '/schedule',
        statistics: '/statistics'
      };
      const path = pathMap[currentView];
      if (path && window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    } else {
      if (currentAuthView === 'reset') return;
      
      const pathMap: Record<string, string> = {
        login: '/',
        signup: '/signup',
        forgot: '/forgot'
      };
      const path = pathMap[currentAuthView];
      if (path && window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  }, [currentView, currentAuthView, isAuthenticated]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (isAuthenticated) {
        setCurrentView(getViewFromPath(window.location.pathname));
      } else {
        setCurrentAuthView(getAuthViewFromPath(window.location.pathname));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setIsAdmin(user.isAdmin);
          
          // Validate current view against permissions
          const intendedView = getViewFromPath(window.location.pathname);
          if (intendedView === 'admin' && !user.isAdmin) {
            setCurrentView('dashboard');
          } else {
            setCurrentView(intendedView);
          }

          // Set userProfile from user data
          setUserProfile({
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            banner: user.banner,
            major: user.major || 'Computer Science',
            location: user.location || 'Unknown',
            streak: user.streak || 0,
            bio: user.bio || 'Welcome to GyanSync! Update your profile to tell others about yourself.',
            joinDate: user.joinDate,
            totalStudyMinutes: user.totalStudyMinutes || 0,
            lastStudyDate: user.lastStudyDate,
          });
          // Fetch user data
          authService.getTasks().then(response => setTasks(response.tasks));
          authService.getSlots().then(response => setSlots(response.slots));
          authService.getFolders().then(response => setFolders(response.folders)).catch(console.error);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch students/users for admin panel
  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      authService.getAdminUsers()
        .then(data => {
          const students = data.users.map((user: any) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || `https://picsum.photos/seed/${user.name.split(' ')[0]}/150/150`,
            banner: user.banner || '',
            major: user.major || 'Not Set',
            location: user.location || 'Not Set',
            streak: user.streak || 0,
            bio: user.bio || 'GyanSync User',
            passwordHash: 'hashed',
            joinDate: user.joinDate || new Date().toISOString().split('T')[0],
            status: 'active'
          }));
          setStudents(students);
        })
        .catch(err => console.error('Failed to fetch admin users:', err));
    }
  }, [isAdmin, isAuthenticated]);

  const handleLogin = async (user: User, asAdmin: boolean = false) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setIsAdmin(user.isAdmin);
    setCurrentView(user.isAdmin ? 'admin' : 'dashboard');
    
    // Set userProfile from user data
    setUserProfile({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      banner: user.banner,
      major: user.major || 'Computer Science',
      location: user.location || 'Unknown',
      streak: user.streak || 0,
      bio: user.bio || 'Welcome to GyanSync! Update your profile to tell others about yourself.',
      joinDate: user.joinDate,
      totalStudyMinutes: user.totalStudyMinutes || 0,
      lastStudyDate: user.lastStudyDate,
    });

    // Streak Logic: Check if streak needs reset on login
    let currentStreak = user.streak || 0;
    const lastStudyDate = user.lastStudyDate;
    
    if (lastStudyDate) {
      const last = new Date(lastStudyDate);
      const today = new Date();
      // Calculate difference in days ignoring time
      const diffTime = Math.abs(today.setHours(0,0,0,0) - last.setHours(0,0,0,0));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1) {
        currentStreak = 0;
        authService.updateProfile({ streak: 0 }).catch(console.error);
        setUserProfile(prev => ({ ...prev, streak: 0 }));
      }
    }

    // Fetch user data
    authService.getTasks().then(response => setTasks(response.tasks)).catch(console.error);
    authService.getSlots().then(response => setSlots(response.slots)).catch(console.error);
    authService.getFolders().then(response => setFolders(response.folders)).catch(console.error);
  };
  
  const handleLogout = () => {
    // End study session if active
    if (sessionStartTime) {
      authService.endStudySession(sessionStartTime).catch(console.error);
      setSessionStartTime(null);
    }
    
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setShowLogoutModal(false);
    setCurrentView('dashboard');
    setCurrentAuthView('login');
    setTasks([]);
    setSlots([]);
    setFolders([]);
    try {
      if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
    } catch (e) {}
  };

  // Session heartbeat to detect remote logout (e.g. from another device)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = setInterval(() => {
      authService.getCurrentUser()
        .catch(err => {
          if (err.response && err.response.status === 401) {
            handleLogout();
          }
        });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkSession);
  }, [isAuthenticated]);

  // Track study session when on dashboard
  useEffect(() => {
    if (isAuthenticated && currentView === 'dashboard' && !sessionStartTime) {
      // Start a study session when entering dashboard
      authService.startStudySession()
        .then(() => {
          setSessionStartTime(new Date());
        })
        .catch(console.error);
    } else if ((currentView !== 'dashboard' || !isAuthenticated) && sessionStartTime) {
      // End study session when leaving dashboard
      authService.endStudySession(sessionStartTime)
        .then((data) => {
          setSessionStartTime(null);
          // Update totalStudyMinutes in profile
          if (data.totalMinutes !== undefined) {
            setUserProfile(prev => ({ ...prev, totalStudyMinutes: data.totalMinutes }));
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, currentView]);

  // Track study session on page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStartTime && isAuthenticated) {
        // Send beacon to track session end (works even on page close)
        const data = JSON.stringify({ startTime: sessionStartTime });
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        navigator.sendBeacon(
          `${apiUrl}/api/study-sessions/end`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionStartTime, isAuthenticated]);

  const handleAddTask = async (title: string, priority: Task['priority'], category: string = 'General') => {
    try {
      const response = await authService.createTask({ title, priority, category });
      setTasks(prev => [response.task, ...prev]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const response = await authService.updateTask(id, { completed: !task.completed });
        setTasks(prev => prev.map(t => t.id === id ? response.task : t));

        // Refresh user profile to get updated streak from server
        if (!task.completed) {
          try {
            const updatedUser = await authService.getCurrentUser();
            setUserProfile(prev => ({ ...prev, streak: updatedUser.streak }));
            setCurrentUser(prev => prev ? { ...prev, streak: updatedUser.streak } : null);
          } catch (error) {
            console.error('Failed to refresh user profile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await authService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      console.log('handleUpdateProfile called with:', Object.keys(updates));
      
      // Update UI immediately
      setUserProfile(prev => ({ 
        ...prev, 
        ...updates,
      }));
      
      console.log('Sending profile update to backend...');
      // Save to database
      const updatedUser = await authService.updateProfile(updates);
      console.log('Profile updated successfully:', updatedUser);
      
      // Sync with updated user data from server
      setUserProfile(prev => ({ 
        ...prev, 
        ...updates,
        totalStudyMinutes: updatedUser.totalStudyMinutes || prev.totalStudyMinutes,
        lastStudyDate: updatedUser.lastStudyDate || prev.lastStudyDate,
        avatar: updatedUser.avatar || prev.avatar,
        banner: updatedUser.banner || prev.banner,
      }));
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Revert UI on error
      setCurrentUser(prev => prev);
    }
  };

  const handleAddSlot = async (newSlot: Omit<StudySlot, 'id'>) => {
    try {
      const response = await authService.createSlot(newSlot);
      setSlots(prev => [...prev, response.slot]);
    } catch (error) {
      console.error('Failed to add slot:', error);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await authService.deleteSlot(id);
      setSlots(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  };

  const handleAddFolder = async (name: string) => {
    try {
      const response = await authService.createFolder({ name });
      setFolders(prev => [...prev, response.folder]);
    } catch (error) {
      console.error('Failed to add folder:', error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await authService.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleAddFile = async (folderId: string, name: string) => {
    try {
      const response = await authService.addFile(folderId, { name });
      setFolders(prev => prev.map(f => f.id === folderId ? response.folder : f));
    } catch (error) {
      console.error('Failed to add file:', error);
    }
  };

  const handleUpdateFolder = (folderId: string, updatedFolder: Folder) => {
    setFolders(prev => prev.map(f => f.id === folderId ? updatedFolder : f));
  };

  const handleDeleteFile = async (folderId: string, fileId: string) => {
    try {
      await authService.deleteFile(folderId, fileId);
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, files: f.files.filter(file => file.id !== fileId) } : f));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  // Student Management (Admin)
  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await authService.deleteUser(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading GyanSync...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthView 
        onLogin={handleLogin} 
      />
    );
  }

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
          avatar: currentUser.avatar || 'https://picsum.photos/seed/' + currentUser.name.toLowerCase().replace(' ', '') + '/150/150',
          banner: currentUser.banner || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
          major: currentUser.major || 'Computer Science',
          location: currentUser.location || 'Unknown',
          streak: currentUser.streak || 0,
          joinDate: currentUser.joinDate || '',
          bio: currentUser.bio || ''
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
            <div className={`absolute left-0 top-0 bottom-0 w-80 shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
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
                    onUpdateFolder={handleUpdateFolder}
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
              onToggleDarkMode={() => setDarkMode(!darkMode)}
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
              slots={slots}
              darkMode={darkMode}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView profile={userProfile} tasks={tasks} onUpdateProfile={handleUpdateProfile} darkMode={darkMode} />
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
