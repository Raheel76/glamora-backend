const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const { protect } = require('../middleware/auth');

router.get('/wallet', protect, adminController.getAdminWallet);
router.get('/dashboard-stats', protect, adminController.getDashboardStats);

module.exports = router;