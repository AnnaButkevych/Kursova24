const express = require('express');
const router = express.Router();
const { generateWaterStationReport } = require('../controllers/reportController');

// Маршрут для генерації PDF-звіту
router.get('/generate-water-report', generateWaterStationReport);

module.exports = router;
