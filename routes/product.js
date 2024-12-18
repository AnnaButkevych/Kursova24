const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Отримати всі продукти
router.get("/", productController.getAll);
router.get('/:productId/quantity', productController.getProductQuantity);

// Отримати продукт за ID
router.get("/:productId", productController.getById);

// Додати новий продукт
router.post("/", productController.add);

// Оновити продукт за ID
router.put("/:productId", productController.update);

// Видалити продукт за ID
router.delete("/:productId", productController.delete);
router.get('/:productId/quantity', productController.getProductQuantity);

// Перевірка кількості продуктів в кошику перед оформленням замовлення
router.get('/check-busket-quantities', productController.checkBusketQuantities);

// Оновлення складу після оформлення замовлення
router.post('/:productId/update-stock', productController.updateProductStock);

// Оновлення складу для всіх товарів після замовлення
router.post('/update-stocks-after-order', productController.updateStocksAfterOrder);

module.exports = router;
