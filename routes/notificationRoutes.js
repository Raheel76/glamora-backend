const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationControllers');
const { protect } = require('../middleware/auth');

// User routes
router.get('/', protect, notificationController.getUserNotifications);
router.put('/:id/read', protect, notificationController.markNotificationAsRead);
router.put('/mark-all-read', protect, notificationController.markAllNotificationsAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

// Admin routes
router.get('/admin/all', protect, notificationController.getAllNotifications);
router.post('/admin/send', protect, notificationController.sendNotification);

module.exports = router;