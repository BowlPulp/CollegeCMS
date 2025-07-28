const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// Add a new student
router.post('/', studentController.addStudent);
// Edit student data
router.put('/:id', studentController.editStudent);
// Bulk upload students
router.post('/upload', studentController.uploadStudents);
// Search students
router.get('/search', studentController.searchStudents);
// Filter students
router.get('/filter', studentController.filterStudents);
// Get filter options
router.get('/filters', studentController.getStudentFilters);
// Paginated, filtered, and searched student list
router.get('/list', studentController.listStudents);
// Get student statistics
router.get('/stats', studentController.getStudentStats);
// Get a single student by ID
router.get('/:id', studentController.getStudent);
// Delete a student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router; 