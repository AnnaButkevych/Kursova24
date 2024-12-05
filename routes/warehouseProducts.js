const express = require('express');
const router = express.Router();
const warehouseProductsController = require('../controllers/warehouseProductsController');

router.get('/', warehouseProductsController.getWarehousesWithProducts);

module.exports = router;
