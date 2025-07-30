const mongoose = require('mongoose');

const predefinedTypes = [
  'Exam',
  'Invigilation',
  'Event',
  'Lab',
  'Seminar',
  'Other'
];

const dutySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dutyType: { type: String, required: true, enum: [...predefinedTypes, 'Custom'] },
  customType: { type: String }, // Only if dutyType is 'Custom'
  dates: [{ type: Date, required: true }], // Array of dates for multi-day duties
  startTime: { type: String, required: true }, // 'HH:mm' 24h format, rounded to 15/30/45/00
  endTime: { type: String, required: true },
  assignedTo: [{ type: String, required: true }], // Array of teacher emails
  location: { type: String },
  createdBy: { type: String, required: true }, // Creator's email
}, { timestamps: true });

module.exports = mongoose.model('Duty', dutySchema); 