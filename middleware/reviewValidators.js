const { param, body } = require('express-validator');
const { handleValidationErrors } = require('./handleValidationErrors.js');

// hi
// Validates restaurant id param: /restaurants/:id/...
const validateRestaurantId = [
    param('id')
        .exists({ checkFalsy: true })
        .withMessage('Restaurant id is required')
        .bail()
        .isMongoId()
        .withMessage('Restaurant id must be a valid Mongo ObjectId'),
    handleValidationErrors,
];

// Validates review id param: .../reviews/:reviewId
const validateReviewId = [
    param('reviewId')
        .exists({ checkFalsy: true })
        .withMessage('reviewId is required')
        .bail()
        .isMongoId()
        .withMessage('reviewId must be a valid Mongo ObjectId'),
    handleValidationErrors,
];

// Validates CREATE review payload
const validateCreateReview = [
    body('authorName')
        .exists({ checkFalsy: true })
        .withMessage('authorName is required')
        .bail()
        .isString()
        .withMessage('authorName must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('authorName cannot be empty'),

    body('rating')
        .exists({ checkFalsy: true })
        .withMessage('rating is required')
        .bail()
        .isFloat({ min: 1, max: 5})
        .withMessage('rating must be a number between 1 and 5')
        .toFloat(),

    body('title')
        .optional()
        .isString()
        .withMessage('title must be a string')
        .trim(),

    body('body')
        .exists({ checkFalsy: true })
        .withMessage('body is required')
        .bail()
        .isString()
        .withMessage('body must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('body cannot be empty'),
    handleValidationErrors,
];

// Validates UPDATE review payload
const validateUpdateReview = [
    body('authorName')
        .optional()
        .isString()
        .withMessage('authorName must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('authorName cannot be empty'),

    body('rating')
        .optional()
        .isFloat({ min: 1, max: 5})
        .withMessage('rating must be a number between 1 and 5')
        .toFloat(),

    body('title')
        .optional()
        .isString()
        .withMessage('title must be a string')
        .trim(),

    body('body')
        .optional()
        .isString()
        .withMessage('body must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('body cannot be empty'),
    handleValidationErrors,   
];

module.exports = {
    validateRestaurantId,
    validateReviewId,
    validateCreateReview,
    validateUpdateReview
};