const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getAllStaffEmails,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');

router.get('/', getAllEvents);
router.get('/staff-emails', getAllStaffEmails);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
