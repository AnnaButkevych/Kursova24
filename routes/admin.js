const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.loginPage);
router.post('/login', adminController.loginAdmin);

module.exports = router;
