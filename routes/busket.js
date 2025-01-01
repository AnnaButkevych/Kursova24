const express = require('express');
const router = express.Router();
const busketController = require('../controllers/busketController');

router.get('/:sessionId', busketController.getBysession); 
router.put('/:productId', busketController.add); 
router.post('/:id', busketController.updateQuantity);
router.delete('/:id', busketController.delete);

module.exports = router;
