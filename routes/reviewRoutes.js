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

router.post('/', validateCreateReview, reviewController.createReviewHandler);
router.get('/', reviewController.getReviewsHandler);
router.get('/:reviewId', validateReviewId, reviewController.getReviewByIdHandler);
router.put('/:reviewId', validateReviewId, validateUpdateReview, reviewController.updateReviewHandler);
router.delete('/:reviewId', validateReviewId, reviewController.deleteReviewHandler);

module.exports = router;