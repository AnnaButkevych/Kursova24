const express = require('express');
const { generatePdf } = require('../controllers/userRepController');
const router = express.Router();

router.get('/generate-pdf', generatePdf);

module.exports = router;
