const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');

// Register route
router.post('/register', register);

// Login route (identifier = email or staffId)
router.post('/login', login);

// Get current user session
router.get('/me', me);

module.exports = router;
