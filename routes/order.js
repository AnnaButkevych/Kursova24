const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/add', orderController.getAddOrderPage);
router.post('/add', orderController.addOrder);
router.delete('/busket/:id', orderController.deleteBusketItem);

module.exports = router;
