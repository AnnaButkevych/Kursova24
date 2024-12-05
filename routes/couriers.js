const express = require('express');
const router = express.Router();
const couriersController = require('../controllers/couriersController');

router.get('/', couriersController.getCouriers);

module.exports = router;
