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

// Get all unique filter values
exports.getStudentFilters = asyncHandler(async (req, res) => {
  const fields = [
    'branch',
    'updatedGroup',
    'cluster',
    'specialization',
    'campus',
    'finalStatus'
  ];
  const filters = {};
  for (const field of fields) {
    filters[field] = await Student.distinct(field);
  }
  res.status(200).json(new ApiResponse(200, filters, 'Filter options'));
});

// Paginated, filtered, and searched student list
exports.listStudents = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 20,
    branch,
    updatedGroup,
    cluster,
    specialization,
    campus,
    finalStatus,
    search
  } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const filter = {};
  if (branch) filter.branch = branch;
  if (updatedGroup) filter.updatedGroup = updatedGroup;
  if (cluster) filter.cluster = cluster;
  if (specialization) filter.specialization = specialization;
  if (campus) filter.campus = campus;
  if (finalStatus !== undefined && finalStatus !== '') filter.finalStatus = finalStatus === 'true';
  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { universityRollNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const total = await Student.countDocuments(filter);
  const students = await Student.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.status(200).json(new ApiResponse(200, {
    students,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }, 'Student list'));
});

// Get student statistics from entire database
exports.getStudentStats = asyncHandler(async (req, res) => {
  const total = await Student.countDocuments({});
  const finalized = await Student.countDocuments({ finalStatus: true });
  const pending = total - finalized;
  const percentFinalized = total > 0 ? ((finalized / total) * 100).toFixed(1) : '0.0';

  res.status(200).json(new ApiResponse(200, {
    total,
    finalized,
    pending,
    percentFinalized
  }, 'Student statistics'));
});

// Get student overview (total, placed, unplaced, placement rate, group-wise, specialization-wise)
exports.getStudentOverview = asyncHandler(async (req, res) => {
  const total = await Student.countDocuments({});
  const finalized = await Student.countDocuments({ finalStatus: true });
  const pending = total - finalized;
  const percentFinalized = total > 0 ? ((finalized / total) * 100).toFixed(1) : '0.0';

  // Group-wise counts
  const groupAgg = await Student.aggregate([
    { $group: { _id: "$updatedGroup", count: { $sum: 1 } } }
  ]);
  const groupWise = {};
  groupAgg.forEach(g => { if (g._id) groupWise[g._id] = g.count; });

  // Specialization-wise counts
  const specAgg = await Student.aggregate([
    { $group: { _id: "$specialization", count: { $sum: 1 } } }
  ]);
  const specializationWise = {};
  specAgg.forEach(s => { if (s._id) specializationWise[s._id] = s.count; });

  res.status(200).json(new ApiResponse(200, {
    total,
    finalized,
    pending,
    percentFinalized,
    groupWise,
    specializationWise
  }, 'Student overview'));
}); 