const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/add', orderController.getAddOrderPage);
router.post('/add', orderController.addOrder);
router.post('/edit/:id', orderController.editOrder);
router.delete('/delete/:id', orderController.deleteOrder);
router.get('/statistics', orderController.getOrderStatistics);
router.get('/report', orderController.generateReport);

module.exports = router;
