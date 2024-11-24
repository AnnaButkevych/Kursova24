const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Отримати всі продукти
router.get("/", productController.getAll);

// Отримати продукт за ID
router.get("/:productId", productController.getById);

// Додати новий продукт
router.post("/", productController.add);

// Оновити продукт за ID
router.put("/:productId", productController.update);

// Видалити продукт за ID
router.delete("/:productId", productController.delete);

module.exports = router;
