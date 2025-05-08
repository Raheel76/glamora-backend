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
    const otpExpires = Date.now() + 1 * 60 * 1000;

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