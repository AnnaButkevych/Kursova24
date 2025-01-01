const express = require('express');
const router = express.Router();
const warehouseProductsActionController = require('../controllers/warehouseProductsActionController');

router.get('/add', warehouseProductsActionController.showAddProductForm); 
router.post('/add', warehouseProductsActionController.addProductToWarehouse);
router.get('/edit/:productId', warehouseProductsActionController.showEditProductForm); 
router.post('/edit/:productId', warehouseProductsActionController.updateProductInWarehouse);
router.post('/delete', warehouseProductsActionController.deleteWarehouseProduct); 

module.exports = router;
