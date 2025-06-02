const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const upload = require('../middleware/upload');



const uploadFields = upload.array('images', 10); // Allow up to 10 images

// Routes for products
router.post('/', uploadFields, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', uploadFields, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;