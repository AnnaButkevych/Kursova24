const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');

router.get('/dashboard', adminDashboardController.getDashboardData);


module.exports = router;