const { check } = require("express-validator");

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
];