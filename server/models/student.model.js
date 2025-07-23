const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  universityRollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  updatedGroup: {
    type: String,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  mobNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  campus: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  cluster: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  newVendor: {
    type: String,
    trim: true
  },
  finalStatus: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  parentsMobile: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
