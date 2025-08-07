// models/Timetable.js

const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true }, // 'image/png', 'application/pdf', etc.
  createdAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true }, // user id
  uploadedByName: { type: String, required: true }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
