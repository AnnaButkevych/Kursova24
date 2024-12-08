const express = require('express');
const router = express.Router();
const warehouseProductsActionController = require('../controllers/warehouseProductsActionController');

// Додавання продукту до складу
router.get('/add', warehouseProductsActionController.showAddProductForm); // форма для додавання продукту
router.post('/add', warehouseProductsActionController.addProductToWarehouse);

// Редагування продукту
router.get('/edit/:productId', warehouseProductsActionController.showEditProductForm); // форма для редагування продукту
router.post('/edit/:productId', warehouseProductsActionController.updateProductInWarehouse);

// Видалення продукту
router.post('/delete', warehouseProductsActionController.deleteWarehouseProduct); // обробка видалення

module.exports = router;
