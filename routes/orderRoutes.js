const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const { protect } = require('../middleware/auth');

// User routes
router.post('/', protect, orderController.createOrder);
router.get('/user', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);

// Admin routes
router.get('/admin/all', protect,  orderController.getAllOrders);
router.put('/admin/:id/status', protect,  orderController.updateOrderStatus);

module.exports = router;