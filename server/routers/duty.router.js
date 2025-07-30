const express = require('express');
const router = express.Router();
const dutyController = require('../controllers/duty.controller');

// CRUD
router.post('/', dutyController.createDuty);
router.get('/', dutyController.getDuties);
router.get('/types', dutyController.getDutyTypes);
router.get('/:id', dutyController.getDuty);
router.put('/:id', dutyController.updateDuty);
router.delete('/:id', dutyController.deleteDuty);

module.exports = router; 