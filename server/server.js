const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Connect to MongoDB Atlas or fallback to local MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gyansync';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue without database connection. Some features may not work.');
  });

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'GyanSync Backend API' });
});

const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Task = require('./models/Task');
const StudySlot = require('./models/StudySlot');
const Folder = require('./models/Folder');
const StudySession = require('./models/StudySession');

// User authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password, joinDate: new Date().toISOString().split('T')[0] });
    await user.save();

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route to get user data
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route to update user profile
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { name, major, location, bio, avatar, banner } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (major !== undefined) updateData.major = major;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (banner !== undefined) updateData.banner = banner;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Tasks API
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    const transformedTasks = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      category: task.category
    }));
    res.json({ tasks: transformedTasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, priority, category } = req.body;
    const task = new Task({
      userId: req.user.id,
      title,
      completed: false,
      priority: priority || 'medium',
      category: category || 'General'
    });
    await task.save();
    const transformedTask = {
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      category: task.category
    };
    res.json({ task: transformedTask });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Handle streak logic when task is completed
    if (completed && !task.completed) {
      const user = await User.findById(req.user.id);
      const today = new Date().toISOString().split('T')[0];
      const lastStudyDate = user.lastStudyDate;
      
      // Only increment streak if this is the first task completion today
      if (lastStudyDate !== today) {
        let newStreak = user.streak || 0;
        
        if (lastStudyDate) {
          const last = new Date(lastStudyDate);
          const todayDate = new Date();
          const lastDate = new Date(lastStudyDate);
          
          // Normalize dates to compare only the date part
          lastDate.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);
          
          const diffTime = Math.abs(todayDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day - increment streak
            newStreak += 1;
          } else if (diffDays > 1) {
            // Gap in streak - reset to 1
            newStreak = 1;
          }
        } else {
          // First time - start streak at 1
          newStreak = 1;
        }
        
        // Update user with new streak and today's date
        await User.findByIdAndUpdate(req.user.id, {
          streak: newStreak,
          lastStudyDate: today
        });
      }
    }
    
    const transformedTask = {
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      category: task.category
    };
    res.json({ task: transformedTask });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Study Slots API
app.get('/api/slots', auth, async (req, res) => {
  try {
    const slots = await StudySlot.find({ userId: req.user.id });
    const transformedSlots = slots.map(slot => ({
      id: slot._id.toString(),
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      color: slot.color
    }));
    res.json({ slots: transformedSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/slots', auth, async (req, res) => {
  try {
    const { day, startTime, endTime, subject, color } = req.body;
    const slot = new StudySlot({
      userId: req.user.id,
      day: day || 'Today',
      startTime,
      endTime,
      subject,
      color: color || 'indigo'
    });
    await slot.save();
    const transformedSlot = {
      id: slot._id.toString(),
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      color: slot.color
    };
    res.json({ slot: transformedSlot });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/slots/:id', auth, async (req, res) => {
  try {
    const slot = await StudySlot.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Folders API
app.get('/api/folders', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id });
    const transformedFolders = folders.map(folder => ({
      id: folder._id.toString(),
      name: folder.name,
      files: folder.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        date: file.date
      }))
    }));
    res.json({ folders: transformedFolders });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/folders', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const folder = new Folder({
      userId: req.user.id,
      name,
      files: []
    });
    await folder.save();
    const transformedFolder = {
      id: folder._id.toString(),
      name: folder.name,
      files: []
    };
    res.json({ folder: transformedFolder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/folders/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Files API
app.post('/api/folders/:folderId/files', auth, upload.single('file'), async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.folderId, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Get file from request
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // Generate unique file ID
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert file buffer to base64
    const fileData = req.file.buffer.toString('base64');
    
    // Calculate file size in human readable format
    const sizeInBytes = req.file.size;
    let sizeStr = '0 B';
    if (sizeInBytes < 1024) {
      sizeStr = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeStr = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    // Create file object
    const newFile = {
      id: fileId,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: sizeStr,
      date: new Date().toISOString().split('T')[0],
      data: fileData // Store base64 encoded file data
    };

    folder.files.push(newFile);
    await folder.save();

    const transformedFolder = {
      id: folder._id.toString(),
      name: folder.name,
      files: folder.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        date: file.date
        // Note: data is not sent to frontend in the list view
      }))
    };
    res.json({ folder: transformedFolder });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get file content (for preview/download)
app.get('/api/folders/:folderId/files/:fileId', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.folderId, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    const file = folder.files.find(f => f.id === req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Convert base64 back to buffer and send
    const fileBuffer = Buffer.from(file.data, 'base64');
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(fileBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get file for preview (returns base64)
app.get('/api/folders/:folderId/files/:fileId/preview', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.folderId, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    const file = folder.files.find(f => f.id === req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    res.json({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      data: `data:${file.type};base64,${file.data}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/folders/:folderId/files/:fileId', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.folderId, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    const fileIndex = folder.files.findIndex(f => f.id === req.params.fileId);
    if (fileIndex === -1) return res.status(404).json({ message: 'File not found' });

    folder.files.splice(fileIndex, 1);
    await folder.save();

    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Study Sessions API
app.post('/api/study-sessions/start', auth, async (req, res) => {
  try {
    const startTime = new Date();
    const sessionData = {
      userId: req.user.id,
      startTime: startTime,
      date: startTime.toISOString().split('T')[0]
    };
    // Store in memory for this user (will be completed on end)
    res.json({ sessionId: `session_${req.user.id}_${Date.now()}`, startTime });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/study-sessions/end', auth, async (req, res) => {
  try {
    const { startTime } = req.body;
    const endTime = new Date();
    const start = new Date(startTime);
    const duration = Math.round((endTime - start) / 60000); // Convert to minutes

    if (duration < 1) {
      return res.status(400).json({ message: 'Session too short' });
    }

    // Create study session record
    const session = new StudySession({
      userId: req.user.id,
      date: endTime.toISOString().split('T')[0],
      duration: duration,
      startTime: start,
      endTime: endTime
    });

    await session.save();

    // Update user's total study minutes
    const user = await User.findById(req.user.id);
    user.totalStudyMinutes = (user.totalStudyMinutes || 0) + duration;
    await user.save();

    res.json({ session, totalMinutes: user.totalStudyMinutes });
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study statistics
app.get('/api/statistics', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get study sessions for the time range
    const sessions = await StudySession.find({
      userId: req.user.id,
      date: { $gte: startDateStr }
    }).sort({ date: 1 });

    // Group by date
    const studyDataByDate = {};
    sessions.forEach(session => {
      if (!studyDataByDate[session.date]) {
        studyDataByDate[session.date] = 0;
      }
      studyDataByDate[session.date] += session.duration;
    });

    // Format for chart (fill missing dates with 0)
    const chartData = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const minutesOnDate = studyDataByDate[dateStr] || 0;
      const hoursOnDate = (minutesOnDate / 60).toFixed(2);

      chartData.push({
        date: dateStr,
        hours: parseFloat(hoursOnDate),
        minutes: minutesOnDate,
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }

    // Calculate total hours
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(2);

    // Get user data for other stats
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ userId: req.user.id });
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      chartData,
      totalHours,
      totalMinutes,
      successRate,
      streak: user.streak,
      completedTasks,
      totalTasks
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total study hours for profile
app.get('/api/study-hours', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const totalMinutes = user.totalStudyMinutes || 0;
    const totalHours = (totalMinutes / 60).toFixed(1);

    res.json({ totalHours, totalMinutes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// Get all users for admin
app.get('/api/admin/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin statistics
app.get('/api/admin/statistics', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const users = await User.find();
    const tasks = await Task.find();
    
    const totalStudents = users.length;
    const activeStudents = users.filter(u => {
      // Consider a student active if they have studied today
      if (!u.lastStudyDate) return false;
      const lastStudy = new Date(u.lastStudyDate);
      const today = new Date();
      const isToday = lastStudy.toDateString() === today.toDateString();
      return isToday;
    }).length;

    const avgStreak = totalStudents > 0 
      ? Math.round(users.reduce((acc, u) => acc + (u.streak || 0), 0) / totalStudents)
      : 0;

    // Calculate growth rate (new users in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLastMonth = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
    const growthRate = totalStudents > 0 ? ((newUsersLastMonth / totalStudents) * 100).toFixed(1) : 0;

    // Monthly user growth data (last 4 months)
    const monthlyData = [];
    for (let i = 3; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      const usersInMonth = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyData.push({
        name: monthNames[targetDate.getMonth()],
        users: users.filter(u => new Date(u.createdAt) <= monthEnd).length
      });
    }

    res.json({
      totalStudents,
      activeStudents,
      avgStreak,
      growthRate: `+${growthRate}%`,
      monthlyData
    });
  } catch (err) {
    console.error('Admin statistics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register student (Admin only)
app.post('/api/admin/register-student', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const { name, email, password, major } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      major: major || 'Not Set',
      isAdmin: false,
      streak: 0,
      totalStudyMinutes: 0,
      bio: 'Welcome to GyanSync!',
      joinDate: new Date().toISOString().split('T')[0]
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({ user: userResponse, message: 'Student registered successfully' });
  } catch (err) {
    console.error('Student registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's tasks and study sessions
    await Task.deleteMany({ userId: req.params.id });
    const StudySession = mongoose.model('StudySession');
    await StudySession.deleteMany({ userId: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Gemini API proxy (for secure API calls)
app.post('/api/gemini', async (req, res) => {
  // TODO: Proxy requests to Gemini API using your API key
  res.json({ response: 'AI response' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});