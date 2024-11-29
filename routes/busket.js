const express = require('express');
const router = express.Router();
const busketController = require('../controllers/busketController');

router.get('/:sessionId', busketController.getBysession); // Get busket items by session
router.put('/:productId', busketController.add); // Add a new item to the busket
router.post('/:id', busketController.updateQuantity); // Update a busket item
router.delete('/:id', busketController.delete);

module.exports = router;
