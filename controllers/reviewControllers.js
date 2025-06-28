const Review = require('../models/Review');
const Order = require('../models/Order');


// User: Create a review for a delivered product
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;

    // Check if order exists, belongs to user, and is delivered
    const order = await Order.findOne({ _id: orderId, userId, status: 'delivered', 'items.productId': productId });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'You can only review delivered products you purchased.'
      });
    }

    // Prevent duplicate review for same product/order/user
    const existingReview = await Review.findOne({ productId, userId, orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product for this order.'

      });
    }

    const review = new Review({ productId, userId, orderId, rating, comment });
    await review.save();
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
};

// User: Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate('userId', 'firstName lastName profileImage');
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// User: Get all reviews by the logged-in user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images');
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your reviews',
      error: error.message
    });
  }
};

// Admin: Reply to a review
exports.adminReplyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;
    // Optionally: check if req.user.role === 'admin'
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { adminReply: reply, repliedAt: new Date() },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reply sent',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error replying to review',
      error: error.message
    });
  }
};

// Admin: Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('userId', 'firstName lastName email profileImage')
      .populate('productId', 'name images');
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all reviews',
      error: error.message
    });
  }
}; 