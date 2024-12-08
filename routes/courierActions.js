const express = require('express');
const router = express.Router();
const courierActionsController = require('../controllers/courierActionsController');

router.get('/add', courierActionsController.addCourierForm);
router.post('/add', courierActionsController.addCourier);
router.get('/edit/:id', courierActionsController.editCourierForm);
router.post('/edit', courierActionsController.editCourier);
router.delete('/delete/:Courier_id', courierActionsController.deleteCourier);
router.post('/delete', courierActionsController.deleteCourier);

module.exports = router;
