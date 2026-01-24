const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'application/octet-stream'
  },
  size: {
    type: String,
    default: '0 B'
  },
  date: {
    type: String,
    default: new Date().toISOString().split('T')[0]
  },
  data: {
    type: String,
    required: false // Base64 encoded file data
  }
}, { _id: false });

const folderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  files: [fileSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Folder', folderSchema);
