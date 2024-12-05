const express = require('express');
const router = express.Router();
const waterStationsController = require('../controllers/waterStationsController');

router.get('/', waterStationsController.getWaterStationsWithProbes);

module.exports = router;
