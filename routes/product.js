const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAll);
router.get('/:productId/quantity', productController.getProductQuantity);
router.get("/:productId", productController.getById);
router.post("/", productController.add);
router.put("/:productId", productController.update);
router.delete("/:productId", productController.delete);
router.get('/:productId/quantity', productController.getProductQuantity);
router.get('/check-busket-quantities', productController.checkBusketQuantities);
router.post('/:productId/update-stock', productController.updateProductStock);
router.post('/update-stocks-after-order', productController.updateStocksAfterOrder);

module.exports = router;
