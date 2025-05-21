const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateSignup = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 20 })
    .withMessage('Name must be maximum 20 characters long'),
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters'),
  validate,
];

exports.validateLogin = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters'),
  validate,
];

exports.validateProfile = [
  check('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  check('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  check('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\+?\d{10,}$/)
    .withMessage('Please provide a valid mobile number'),
  check('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  validate,
];