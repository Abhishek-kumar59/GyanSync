const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// User authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
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
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
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
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, major, location, bio, avatar, banner },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Tasks API (placeholder)
app.get('/api/tasks', (req, res) => {
  // TODO: Fetch tasks from DB
  res.json({ tasks: [] });
});

app.post('/api/tasks', (req, res) => {
  // TODO: Save task to DB
  res.json({ message: 'Task created' });
});

// Gemini API proxy (for secure API calls)
app.post('/api/gemini', async (req, res) => {
  // TODO: Proxy requests to Gemini API using your API key
  res.json({ response: 'AI response' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});