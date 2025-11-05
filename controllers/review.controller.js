const reviewService = require('../services/review.service');

const getAllReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const reviews = await reviewService.getAllReviews(productId);
    // userName 필드 추가
    const reviewsWithUserName = reviews.map(review => ({
      ...review,
      userName: review.user?.name || '익명'
    }));
    res.json({
      success: true,
      data: reviewsWithUserName
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    // userName 필드 추가
    const reviewWithUserName = {
      ...review,
      userName: review.user?.name || '익명'
    };
    res.status(201).json({
      success: true,
      data: reviewWithUserName,
      message: 'Review created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.updateReview(id, req.user.id, req.body);
    // userName 필드 추가
    const reviewWithUserName = {
      ...review,
      userName: review.user?.name || '익명'
    };
    res.json({
      success: true,
      data: reviewWithUserName,
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id, req.user.id);
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
};

