const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    default: new Date().toISOString().split('T')[0]
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudySession', studySessionSchema);
