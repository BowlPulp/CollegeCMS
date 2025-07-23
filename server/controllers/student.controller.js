const Student = require('../models/student.model');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// Add a new student
exports.addStudent = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.universityRollNumber || !data.studentName || !data.email) {
    throw new ApiError(400, 'University Roll Number, Student Name, and Email are required');
  }
  const student = await Student.create(data);
  res.status(201).json(new ApiResponse(201, student, 'Student added successfully'));
});

// Edit student data
exports.editStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const student = await Student.findByIdAndUpdate(id, updates, { new: true });
  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json(new ApiResponse(200, student, 'Student updated successfully'));
});

// Upload students (bulk insert)
exports.uploadStudents = asyncHandler(async (req, res) => {
  const students = req.body.students;
  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, 'Students array is required');
  }
  const result = await Student.insertMany(students, { ordered: false });
  res.status(201).json(new ApiResponse(201, result, 'Students uploaded successfully'));
});

// Search students by name, roll number, or email
exports.searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required');
  const students = await Student.find({
    $or: [
      { studentName: { $regex: q, $options: 'i' } },
      { universityRollNumber: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  });
  res.status(200).json(new ApiResponse(200, students, 'Search results'));
});

// Filter students by group, branch, cluster, specialization, campus, or finalStatus
exports.filterStudents = asyncHandler(async (req, res) => {
  const filter = {};
  const allowed = ['updatedGroup', 'branch', 'cluster', 'specialization', 'campus', 'finalStatus'];
  allowed.forEach(key => {
    if (req.query[key] !== undefined) filter[key] = req.query[key];
  });
  const students = await Student.find(filter);
  res.status(200).json(new ApiResponse(200, students, 'Filtered students'));
});

// Get a single student by ID
exports.getStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json(new ApiResponse(200, student, 'Student found'));
});

// Delete a student by ID
exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json(new ApiResponse(200, null, 'Student deleted successfully'));
}); 