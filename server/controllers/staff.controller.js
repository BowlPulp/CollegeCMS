const Teacher = require('../models/staff.model');

// Create (Add) Teacher
exports.createTeacher = async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Teachers (with optional filtering/pagination)
exports.getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.isVerified !== undefined) query.isVerified = filters.isVerified === "true";
    if (filters.designation) query.designation = filters.designation;

    const teachers = await Teacher.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Teacher.countDocuments(query);

    res.json({ teachers, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get One Teacher by ID
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// getDistinctRolesAndDesignations
exports.filterOptions = async (req, res) => {
  const role = await Teacher.distinct('role');
  const designation = await Teacher.distinct('designation');
  res.json({ role, designation, isVerified: ["", "true", "false"] });
};


// Bulk upload from JSON array
exports.bulkUpload = async (req, res) => {
  try {
    const arr = req.body.teachers;
    if (!Array.isArray(arr)) return res.status(400).json({ error: "Data must be teachers array" });
    // (Hash passwords/normalize if required)
    // Insert and error handling
    const result = await Teacher.insertMany(arr, { ordered: false });
    res.json({ inserted: result.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
