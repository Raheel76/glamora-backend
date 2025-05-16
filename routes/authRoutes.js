const express = require('express');
const router = express.Router();
const validate = require('../middleware/validation');
const authController = require('../controllers/authControllers');
const { protect } = require('../middleware/auth');



router.post('/signup', validate.validateSignup, authController.signup);
router.post('/login', validate.validateLogin, authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-otp', authController.verifyOtp)
router.post('/reset-password', authController.resetPassword)
router.post('/logout', protect, authController.logout);
router.get('/verify', protect, authController.verify)

module.exports = router;
