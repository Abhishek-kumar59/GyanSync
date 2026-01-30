const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, default: 'https://picsum.photos/seed/default/150/150' },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop' },
  major: { type: String, default: 'Computer Science' },
  location: { type: String, default: 'Unknown' },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: String, default: null },
  totalStudyMinutes: { type: Number, default: 0 },
  bio: { type: String, default: 'Welcome to GyanSync! Update your profile to tell others about yourself.' },
  joinDate: { type: String, default: new Date().toISOString().split('T')[0] },
  lastActive: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);