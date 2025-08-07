const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/staff.controller');

// CRUD routes
router.post('/', teacherController.createTeacher);
router.get('/list', teacherController.getTeachers);           // GET /api/teachers/list
router.get('/filters', teacherController.filterOptions);      // GET /api/teachers/filters
router.post('/upload', teacherController.bulkUpload);         // POST /api/teachers/upload
router.get('/overview', teacherController.getVerifiedTeacherCount);
router.get('/adminsoverview', teacherController.getVerifiedAdminCount);
router.get('/:id', teacherController.getTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
module.exports = router;
