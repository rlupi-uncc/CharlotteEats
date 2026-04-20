const reviewService = require('../services/reviewService.js');

// hi
// POST /restaurants/:id/reviews/
async function createReviewHandler(req, res) {
    const restaurantId = req.params.id;
    const userId = req.user.id; // from requireAuth JWT payload
  
    const createdReview = await reviewService.createReview(restaurantId, userId, req.body);
    res.status(201).json(createdReview);
  }

// GET /restaurants/:id/reviews/
async function getReviewsHandler(req, res) {
    const restaurantId = req.params.id;
    const sort = (req.query.sort || "newest").trim().toLowerCase();

    const reviews = await reviewService.getReviews(restaurantId);

    if (sort === "likes"){
        reviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === "newest") {
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    res.status(200).json(reviews);
}

// GET /restaurants/:id/reviews/:reviewId
async function getReviewByIdHandler(req, res) {
    const restaurantId = req.params.id;
    const reviewId = req.params.reviewId;

    const review = await reviewService.getReviewById(restaurantId, reviewId);
    res.status(200).json(review);
}

// PUSH /restaurants/:id/reviews/:reviewId
async function updateReviewHandler(req, res) {
    const restaurantId = req.params.id;
    const reviewId = req.params.reviewId;

    const updatedReview = await reviewService.updateReview(restaurantId, reviewId, req.body);
    res.status(200).json(updatedReview);
}

// DELETE /restaurants/:id/reviews/:reviewId
async function deleteReviewHandler(req, res) {
    const restaurantId = req.params.id;
    const reviewId = req.params.reviewId;
    const userId = req.user.id;
  
    await reviewService.deleteReview(restaurantId, reviewId, userId);
    res.status(204).send();
  }

module.exports = {
    createReviewHandler,
    getReviewsHandler,
    getReviewByIdHandler,
    updateReviewHandler,
    deleteReviewHandler,
};