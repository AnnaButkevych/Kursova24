const express = require('express');
const router = express.Router();
const deliveryActionsController = require('../controllers/deliveryActionsController');

router.get('/edit/:id', deliveryActionsController.editDeliveryForm);

router.get('/delete/:id', deliveryActionsController.deleteDeliveryForm);

router.get('/add', deliveryActionsController.addDeliveryForm);

router.post('/edit', deliveryActionsController.editDelivery);

router.post('/delete', deliveryActionsController.deleteDelivery);

router.post('/add', deliveryActionsController.addDelivery);

module.exports = router;
