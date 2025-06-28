const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewControllers');
const { protect } = require('../middleware/auth');

// User: Create a review for a delivered product
router.post('/', protect, reviewController.createReview);
// User: Get all reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);
// User: Get all reviews by the logged-in user
router.get('/user', protect, reviewController.getUserReviews);
// Admin: Reply to a review
router.put('/admin/:reviewId/reply', protect, reviewController.adminReplyToReview);
// Admin: Get all reviews
router.get('/admin/all', protect, reviewController.getAllReviews);

module.exports = router; 