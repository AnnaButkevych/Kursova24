const express = require('express');
const router = express.Router();
const busketController = require('../controllers/busketController');

// Routes for the busket
router.get('/add-to-busket/:productId', busketController.add);

router.get('/:sessionId', busketController.getBysession); // Get busket items by session
router.post('/', busketController.add); // Add a new item to the busket
router.put('/:id', busketController.update); // Update a busket item
router.delete('/:id', busketController.delete); // Delete a busket item

module.exports = router;
