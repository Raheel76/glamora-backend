const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletControllers');
const { protect } = require('../middleware/auth');

// User routes
router.get('/user', protect, walletController.getUserWallet);
router.get('/user/transactions', protect, walletController.getWalletTransactions);

// Admin routes
router.post('/refund', protect, walletController.processRefund);

module.exports = router;
