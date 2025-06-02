const { check } = require('express-validator');

exports.validateProduct = [
  check('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  check('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
  check('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Men', 'Women', 'Kids'])
    .withMessage('Invalid category'),
  check('subcategory')
    .notEmpty()
    .withMessage('Subcategory is required')
    .isIn(['Shirts', 'Pants', 'Dresses', 'Tops', 'T-Shirts', 'Shorts'])
    .withMessage('Invalid subcategory'),
  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  check('fitType')
    .notEmpty()
    .withMessage('Fit type is required')
    .isIn(['Wide leg', 'Slim', 'Regular', 'Loose'])
    .withMessage('Invalid fit type'),
  check('stretch')
    .notEmpty()
    .withMessage('Stretch is required')
    .isIn(['None', 'Low', 'Medium', 'High'])
    .withMessage('Invalid stretch'),
  check('transparency')
    .notEmpty()
    .withMessage('Transparency is required')
    .isIn(['None', 'Low', 'Medium', 'High'])
    .withMessage('Invalid transparency'),
  check('handFeel')
    .notEmpty()
    .withMessage('Hand feel is required')
    .isIn(['Regular', 'Soft', 'Rough'])
    .withMessage('Invalid hand feel'),
  check('lining')
    .notEmpty()
    .withMessage('Lining is required')
    .isIn(['None', 'Full', 'Partial'])
    .withMessage('Invalid lining'),
  check('material')
    .notEmpty()
    .withMessage('Material is required')
    .isLength({ max: 100 })
    .withMessage('Material cannot exceed 100 characters'),
  check('size')
    .notEmpty()
    .withMessage('Size is required')
    .isIn(['SMALL', 'MEDIUM', 'LARGE', 'XL'])
    .withMessage('Invalid size'),
  check('occasion')
    .notEmpty()
    .withMessage('Occasion is required')
    .isIn(['Formal Casual', 'Casual', 'Formal', 'Party'])
    .withMessage('Invalid occasion'),
  check('designDetails')
    .notEmpty()
    .withMessage('Design details are required')
    .isLength({ max: 500 })
    .withMessage('Design details cannot exceed 500 characters'),
  check('note')
    .notEmpty()
    .withMessage('Note is required')
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
];