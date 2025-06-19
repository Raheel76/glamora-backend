const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const { protect } = require('../middleware/auth');

router.post('/', protect, orderController.createOrder);
router.get('/user', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.get('/admin/all', protect, orderController.getAllOrders);
router.put('/admin/:id/status', protect, orderController.updateOrderStatus);
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
