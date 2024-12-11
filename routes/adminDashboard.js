const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');

router.get('/dashboard', adminDashboardController.getDashboardData);

router.get('/edit-order/:id', adminDashboardController.getEditOrderForm);
router.post('/edit-order/:id', adminDashboardController.updateOrder);

router.post('/delete-order/:id', adminDashboardController.deleteOrder);

module.exports = router;