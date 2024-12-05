const express = require('express');
const router = express.Router();
const deliveriesController = require('../controllers/deliveriesController');

router.get('/', deliveriesController.getDeliveries);

module.exports = router;
