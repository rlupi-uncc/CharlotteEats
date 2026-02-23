const reviewService = require('../services/reviewService.js');

// hi
// POST /restaurants/:id/reviews/
async function createReviewHandler(req, res) {
    const restaurantId = req.params.id;

    const createdReview = await reviewService.createReview(restaurantId, req.body);
    res.status(201).json(createdReview);
}

// GET /restaurants/:id/reviews/
async function getReviewsHandler(req, res) {
    const restaurantId = req.params.id;

    const reviews = await reviewService.getReviews(restaurantId);
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

    await reviewService.deleteReview(restaurantId, reviewId);
    res.status(204).send();
}

module.exports = {
    createReviewHandler,
    getReviewsHandler,
    getReviewByIdHandler,
    updateReviewHandler,
    deleteReviewHandler,
};