const express = require('express');
const { getAllCHOs, addCHO, deleteCHO } = require('../controllers/cho.controller.js');

const router = express.Router();

router.get('/', getAllCHOs);
router.post('/', addCHO);
router.delete('/:id', deleteCHO);

module.exports = router;
