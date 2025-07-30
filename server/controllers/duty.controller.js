const Duty = require('../models/duty.model');
const Staff = require('../models/staff.model');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendDutyNotifications } = require('../utils/emailService');

// Create a new duty
exports.createDuty = asyncHandler(async (req, res) => {
  const {
    title, description, dutyType, customType, dates, startTime, endTime, assignedTo, location, createdBy
  } = req.body;

  if (!title || !dutyType || !dates || !startTime || !endTime || !assignedTo || !createdBy) {
    throw new ApiError(400, 'Missing required fields');
  }

  const duty = await Duty.create({
    title, description, dutyType, customType, dates, startTime, endTime, assignedTo, location, createdBy
  });

  // Send email notification to assignedTo
  await sendDutyNotifications(duty, assignedTo);

  res.status(201).json(new ApiResponse(201, duty, 'Duty created successfully'));
});

// Get all duties (optionally filter by teacher, date, week)
exports.getDuties = asyncHandler(async (req, res) => {
  const { teacher, date, weekStart, weekEnd } = req.query;
  let query = {};
  if (teacher) query.assignedTo = teacher;
  if (date) query.dates = { $in: [new Date(date)] };
  if (weekStart && weekEnd) {
    query.dates = { $gte: new Date(weekStart), $lte: new Date(weekEnd) };
  }
  const duties = await Duty.find(query).sort({ 'dates': 1, 'startTime': 1 });
  res.json(new ApiResponse(200, duties, 'Duties fetched successfully'));
});

// Get a single duty
exports.getDuty = asyncHandler(async (req, res) => {
  const duty = await Duty.findById(req.params.id);
  if (!duty) throw new ApiError(404, 'Duty not found');
  res.json(new ApiResponse(200, duty, 'Duty fetched successfully'));
});

// Update a duty
exports.updateDuty = asyncHandler(async (req, res) => {
  const duty = await Duty.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!duty) throw new ApiError(404, 'Duty not found');
  // Send email notification to assignedTo
  if (req.body.assignedTo) {
    await sendDutyNotifications(duty, req.body.assignedTo);
  }
  res.json(new ApiResponse(200, duty, 'Duty updated successfully'));
});

// Delete a duty
exports.deleteDuty = asyncHandler(async (req, res) => {
  const duty = await Duty.findByIdAndDelete(req.params.id);
  if (!duty) throw new ApiError(404, 'Duty not found');
  res.json(new ApiResponse(200, null, 'Duty deleted successfully'));
});

// Get predefined duty types
exports.getDutyTypes = asyncHandler(async (req, res) => {
  const types = ['Exam', 'Invigilation', 'Event', 'Lab', 'Seminar', 'Other', 'Custom'];
  res.json(new ApiResponse(200, types, 'Duty types fetched successfully'));
}); 