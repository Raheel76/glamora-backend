const express = require('express');
const router = express.Router();
const validate = require('../middleware/validation');
const authController = require('../controllers/authControllers')



router.post('/signup', validate.validateSignup, authController.signup);
router.post('/login', validate.validateLogin, authController.login)
router.post('/forgot-password', authController.forgotPassword)

module.exports = router;
