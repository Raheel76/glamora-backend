const Order = require('../models/Order');
const Notification = require('../models/Notification');
const AdminWallet = require('../models/AdminWallet');
const Product = require('../models/product');


exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user._id
    };

    const order = new Order(orderData);
    await order.save();

    // Decrement product stock for each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Decrement stock by the quantity ordered
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        await product.save();
      }
    }

    // Update admin wallet
    await updateAdminWallet(order);

    // Send order confirmation notification
    const notification = new Notification({
      userId: req.user._id,
      orderId: order._id,
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber} has been placed successfully and is being processed.`,
      type: 'order_update'
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Update admin wallet
    await updateAdminWallet(order);

    // Send cancellation notification to user
    const userNotification = new Notification({
      userId: req.user._id,
      orderId: order._id,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled successfully. Refund will be processed within 3-5 business days.`,
      type: 'order_update'
    });
    await userNotification.save();

    // Send refund request notification to admin
    const adminNotification = new Notification({
      userId: req.user._id, // This will be used to identify the customer
      orderId: order._id,
      title: 'Refund Request',
      message: `A refund request has been initiated for order #${order.orderNumber}. Amount to be refunded: Rs.${order.total}`,
      type: 'general'
    });
    await adminNotification.save();

    // Return products to stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Admin controllers
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all orders',
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update admin wallet
    await updateAdminWallet(order);

    // Send status update notification
    let notificationTitle = 'Order Status Updated';
    let notificationMessage = `Your order #${order.orderNumber} status has been updated to ${status}.`;

    if (status === 'delivered') {
      notificationTitle = 'Order Delivered!';
      notificationMessage = `Great news! Your order #${order.orderNumber} has been delivered successfully. Thank you for shopping with us!`;
       // Add review reminder notifications for each product
       for (const item of order.items) {
        const reviewNotification = new Notification({
          userId: order.userId,
          orderId: order._id,
          productId: item.productId,
          title: `How was your ${item.name}?`,
          message: `Click here to review the product and share your experience.`,
          type: 'review_reminder'
        });
        await reviewNotification.save();
      }
    } else if (status === 'shipped') {
      notificationTitle = 'Order Shipped';
      notificationMessage = `Your order #${order.orderNumber} has been shipped and is on its way to you. You can track your package using the tracking information.`;
    }

    const notification = new Notification({
      userId: order.userId,
      orderId: order._id,
      title: notificationTitle,
      message: notificationMessage,
      type: status === 'delivered' ? 'order_delivered' : 'order_update'
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Helper function to update admin wallet
const updateAdminWallet = async (order) => {
  try {
    let wallet = await AdminWallet.findOne({});

    if (!wallet) {
      wallet = new AdminWallet();
    }

    // Remove old transaction if exists
    wallet.transactions = wallet.transactions.filter(
      transaction => transaction.orderId.toString() !== order._id.toString()
    );

    // Add new transaction
    const transaction = {
      userId: order.userId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      amount: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status === 'delivered' ? 'completed' :
        order.status === 'cancelled' ? 'cancelled' : 'pending',
      date: order.createdAt
    };

    wallet.transactions.push(transaction);

    // Recalculate totals
    const completedTransactions = wallet.transactions.filter(t => t.status === 'completed');
    const pendingTransactions = wallet.transactions.filter(t => t.status === 'pending');

    wallet.completedAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    wallet.pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    wallet.totalRevenue = wallet.completedAmount + wallet.pendingAmount;
    wallet.lastUpdated = new Date();

    await wallet.save();
  } catch (error) {
    console.error('Error updating admin wallet:', error);
  }
};