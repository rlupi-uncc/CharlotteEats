const express = require('express');
const router = express.Router( {mergeParams: true} );

const reviewController = require('../controllers/reviewController.js');
const {
    validateRestaurantId,
    validateReviewId,
    validateCreateReview,
    validateUpdateReview,
} = require('../middleware/reviewValidators.js');

router.use(validateRestaurantId);

// POST /restaurants/:id/reviews/
router.post('/', validateCreateReview, reviewController.createReviewHandler);

// GET /restaurants/:id/reviews/
router.get('/', reviewController.getReviewsHandler);

// GET /restaurants/:id/reviews/:reviewId
router.get('/:reviewId', validateReviewId, reviewController.getReviewByIdHandler);

// PUT /restaurants/:id/reviews/:reviewId
router.put('/:reviewId', validateReviewId, validateUpdateReview, reviewController.updateReviewHandler);

// DELETE /restaurants/:id/reviews/:reviewId
router.delete('/:reviewId', validateReviewId, reviewController.deleteReviewHandler);

module.exports = router;