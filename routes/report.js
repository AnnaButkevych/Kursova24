const express = require('express');
const router = express.Router();
const { generateWaterStationReport } = require('../controllers/reportController');

router.get('/generate-water-report', generateWaterStationReport);

module.exports = router;
