const express = require('express');
const orderController = require('../controllers/order');
const { verify, verifyAdmin } = require('../auth');

const router = express.Router();

router.post('/checkout', verify, orderController.checkout);

router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders);

router.get('/my-orders', verify, orderController.getMyOrders);

module.exports = router;