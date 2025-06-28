const Notification = require('../models/Notification');
const User = require('../models/user');
const Order = require('../models/Order');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('orderId', 'orderNumber')
      .populate('productId', '_id')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Admin: Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('userId', 'email firstName lastName')
      .populate('orderId', 'orderNumber')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notification => ({
      ...notification.toObject(),
      recipientEmail: notification.userId?.email,
      orderNumber: notification.orderId?.orderNumber,
      productName: notification.productId?.name
    }));

    res.status(200).json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Admin: Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, orderId, userId } = req.body;

    let targetUsers = [];

    if (userId) {
      // Send to specific user
      targetUsers = [userId];
    } else if (orderId) {
      // Send to order customer
      const order = await Order.findById(orderId).populate('userId');
      if (order) {
        targetUsers = [order.userId._id];
      }
    } else {
      // Send to all users (broadcast)
      const users = await User.find({}, '_id');
      targetUsers = users.map(user => user._id);
    }

    const notifications = [];
    for (const targetUserId of targetUsers) {
      const notification = new Notification({
        userId: targetUserId,
        orderId: orderId || null,
        title,
        message,
        type
      });
      notifications.push(notification);
    }

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} user(s)`,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};