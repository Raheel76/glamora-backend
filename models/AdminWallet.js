const mongoose = require('mongoose');


const adminWalletSchema = new mongoose.Schema({
  totalRevenue: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  completedAmount: {
    type: Number,
    default: 0
  },
  transactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: String,
    customerName: String,
    amount: Number,
    paymentMethod: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    date: { type: Date, default: Date.now() }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now()
  }
});


module.exports = mongoose.model('AdminWallet', adminWalletSchema);


