const AdminWallet = require('../models/AdminWallet');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Get admin wallet data
exports.getAdminWallet = async (req, res) => {
  try {
    let wallet = await AdminWallet.findOne({});
    
    if (!wallet) {
      // Initialize wallet if doesn't exist
      wallet = new AdminWallet();
      await wallet.save();
    }

    // Get recent transactions (last 100)
    const recentTransactions = wallet.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 100);

    const walletData = {
      totalRevenue: wallet.totalRevenue || 0,
      pendingAmount: wallet.pendingAmount || 0,
      completedAmount: wallet.completedAmount || 0,
      transactions: recentTransactions
    };

    res.status(200).json({
      success: true,
      data: walletData
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet data',
      error: error.message
    });
  }
};

// Update wallet (called when order status changes)
exports.updateWallet = async (orderId, newStatus) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    let wallet = await AdminWallet.findOne({});
    if (!wallet) {
      wallet = new AdminWallet();
    }

    // Update transaction status
    const transactionIndex = wallet.transactions.findIndex(
      t => t.orderId.toString() === orderId.toString()
    );

    if (transactionIndex !== -1) {
      wallet.transactions[transactionIndex].status = 
        newStatus === 'delivered' ? 'completed' : 
        newStatus === 'cancelled' ? 'cancelled' : 'pending';
    }

    // Recalculate totals
    const completedTransactions = wallet.transactions.filter(t => t.status === 'completed');
    const pendingTransactions = wallet.transactions.filter(t => t.status === 'pending');

    wallet.completedAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    wallet.pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    wallet.totalRevenue = wallet.completedAmount + wallet.pendingAmount;
    wallet.lastUpdated = new Date();

    await wallet.save();
  } catch (error) {
    console.error('Error updating wallet:', error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const wallet = await AdminWallet.findOne({});
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const stats = {
      totalRevenue: wallet?.totalRevenue || 0,
      completedAmount: wallet?.completedAmount || 0,
      pendingAmount: wallet?.pendingAmount || 0,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      successRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};