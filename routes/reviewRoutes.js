const express = require('express');
const router = express.Router( {mergeParams: true} );

const reviewController = require('../controllers/reviewController.js');

router.post(',', reviewController.createReviewHandler);
router.get('/', reviewController.getReviewsHandler);
router.get('/:reviewId', reviewController.getReviewByIdHandler);
router.put('/:reviewId', reviewController.updateReviewHandler);
router.delete('/:reviewId', reviewController.deleteReviewHandler);

module.exports = router;