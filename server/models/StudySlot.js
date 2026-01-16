const mongoose = require('mongoose');

const studySlotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    default: 'Today'
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'indigo'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudySlot', studySlotSchema);
