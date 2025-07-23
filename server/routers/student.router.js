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
// Get a single student by ID
router.get('/:id', studentController.getStudent);
// Delete a student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router; 