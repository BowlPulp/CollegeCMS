const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // Should be hashed before saving (use middleware in controller/service)
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contactNo: {
    type: String,
    required: true,
    trim: true,
    // Add regex for phone validation if needed
  },
  role: {
    type: String,
    enum: ['admin', 'teacher'],
    required: true,
    default: 'teacher',
  },
  otp: {
    type: String,
    // Should be hashed before saving (for security)
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Staff', staffSchema);
