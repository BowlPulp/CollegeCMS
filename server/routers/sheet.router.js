const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheet.controller');

// GET /api/sheets - get all sheets
router.get('/', sheetController.getAllSheets);

// POST /api/sheets - create a new sheet
router.post('/', sheetController.createSheet);

// DELETE /api/sheets/:id - delete a sheet by id
router.delete('/:id', sheetController.deleteSheet);

module.exports = router; 