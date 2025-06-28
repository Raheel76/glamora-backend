const UserWallet = require('../models/UserWallet');
const AdminWallet = require('../models/AdminWallet');
const Notification = require('../models/Notification');


// Get user wallet
exports.getUserWallet = async (req, res) => {
  try {
    let wallet = await UserWallet.findOne({ userId: req.user._id });
   
    if (!wallet) {
      wallet = new UserWallet({ userId: req.user._id });
      await wallet.save();
    }


    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet',
      error: error.message
    });
  }
};


// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { orderId, amount, orderNumber } = req.body;
    let userId = req.body.userId;


    // Update admin wallet
    let adminWallet = await AdminWallet.findOne({});
    if (!adminWallet) {
      adminWallet = new AdminWallet();
    }


    // Find the transaction by orderId
    const transactionIndex = adminWallet.transactions.findIndex(
      t => t.orderId && t.orderId.toString() === orderId.toString()
    );


    if (transactionIndex === -1) {
      console.error('Refund error: Transaction not found in admin wallet for orderId', orderId);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found in admin wallet for this order. Please check the order and try again.'
      });
    }


    // Use userId from the transaction for security
    if (adminWallet.transactions[transactionIndex].userId) {
      userId = adminWallet.transactions[transactionIndex].userId;
    } else {
      console.error('Refund error: userId missing in admin wallet transaction for orderId', orderId);
      return res.status(400).json({
        success: false,
        message: 'User ID missing in admin wallet transaction. Please update your admin wallet data.'
      });
    }


    // Update admin wallet transaction status
    adminWallet.transactions[transactionIndex].status = 'refunded';


    // Recalculate admin wallet totals
    const completedTransactions = adminWallet.transactions.filter(t => t.status === 'completed');
    adminWallet.completedAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    adminWallet.lastUpdated = new Date();
    await adminWallet.save();


    // Update user wallet
    let userWallet = await UserWallet.findOne({ userId });
    if (!userWallet) {
      userWallet = new UserWallet({ userId });
    }


    // Add refund transaction
    userWallet.transactions.push({
      orderId,
      orderNumber,
      amount,
      type: 'refund',
      status: 'completed',
      description: `Refund for order #${orderNumber}`
    });


    // Update balance
    userWallet.balance += amount;
    userWallet.lastUpdated = new Date();
    await userWallet.save();


    // Send notification to user
    const notification = new Notification({
      userId,
      orderId,
      title: 'Refund Processed',
      message: `Your refund of Rs.${amount} for order #${orderNumber} has been processed successfully. The amount has been added to your wallet.`,
      type: 'general'
    });
    await notification.save();


    res.status(200).json({
      success: true,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};


// Get user wallet transactions
exports.getWalletTransactions = async (req, res) => {
  try {
    const wallet = await UserWallet.findOne({ userId: req.user._id })
      .populate('transactions.orderId', 'orderNumber');


    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }


    res.status(200).json({
      success: true,
      data: wallet.transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};




