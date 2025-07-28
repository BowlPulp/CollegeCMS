const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheet.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// GET /api/sheets - get all sheets
router.get('/', sheetController.getAllSheets);

// POST /api/sheets - create a new sheet
router.post('/', sheetController.createSheet);

// GET /api/sheets/pinned - get pinned sheets for current user
router.get('/pinned', authenticateJWT, sheetController.getPinnedSheets);
// POST /api/sheets/pin - pin a sheet
router.post('/pin', authenticateJWT, sheetController.pinSheet);
// POST /api/sheets/unpin - unpin a sheet
router.post('/unpin', authenticateJWT, sheetController.unpinSheet);

// DELETE /api/sheets/:id - delete a sheet by id
router.delete('/:id', sheetController.deleteSheet);

module.exports = router; 