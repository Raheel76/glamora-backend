const User = require('../models/user');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", path: 'email' })
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", path: 'password' })
    }

    const token = user.generateAuthToken()

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User authenticated successfully',

      token,
      user: userResponse
    })

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error')

  }
}

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req)

  if (!errors) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {

    const { email } = req.body;

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ success: false, message: "No user found with this email address" })
    }

    // 2. Generate OTP and set expiration (10 minutes from now)
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 3. Save OTP to user document
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpires
    await user.save()

    // In a real app, you would send the OTP via email here
    // For your requirement, we're just storing it in MongoDB
    res.status(200).json({
      success: true,
      data: {
        otp,
        email
      },
      message: 'Otp sent successfully'
    })

  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
}

exports.verifyOtp = async (req, res) => {
  try {
    // 1. Extract email and OTP from request body
    const { email, otp } = req.body;

    // 2. Verify OTP against database record
    const user = await User.findOne({
      email,                      // Match user by email
      resetPasswordOtp: otp,       // Match the exact OTP
      resetPasswordOtpExpires: {   // Check OTP hasn't expired
        $gt: Date.now()            // Expiry time > current time
      }
    });

    // 3. Handle invalid/expired OTP
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP has expired',
        errorType: 'OTP_VALIDATION_FAILED'
      });
    }

    // 4. Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 5. Update user document
    user.resetPasswordToken = resetToken;       // Store new token
    user.resetPasswordExpire = Date.now() +     // Set 30min expiry
      30 * 60 * 1000;                          // (in milliseconds)
    user.resetPasswordOtp = undefined;          // Clear used OTP
    user.resetPasswordOtpExpires = undefined;   // Clear OTP expiry
    await user.save({ validateBeforeSave: false }); // Skip validation

    // 6. Return success response
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken,
        expiresIn: '30 minutes'  // Client-facing expiry info
      }
    });

  } catch (err) {
    // 7. Handle unexpected errors
    console.error('OTP Verification Error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      errorDetails: process.env.NODE_ENV === 'development'
        ? err.message
        : undefined
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    // 1. Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // 2. Find user by token and check expiration
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or token has expired'
      });
    }

    // 3. Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};