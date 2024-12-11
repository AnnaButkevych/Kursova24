const express = require('express');
const router = express.Router();
const customersActionController = require('../controllers/customersActionController');

router.get('/edit/:id', customersActionController.getEditCustomerForm);
router.post('/edit/:id', customersActionController.updateCustomer);
router.post('/delete/:id', customersActionController.deleteCustomer);

module.exports = router;
