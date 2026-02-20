const handleValidationErrors = require('./handleValidationErrors.js');
const expressvalidator = require('express-validator');

export const validateUser = [
    expressvalidator.body(`email`)
    .exists({values: `false`})
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('email is not valid')
    .normalizeEmail(),

    expressvalidator.body('password')
    .exists({values: 'false'})
    .withMessage('password is required')
    .bail()
    .isLength({min: 8, max: 64})
    .withMessage('password must contain at least 8 and at most 64 characters'),

    handleValidationErrors.handleValidationErrors,
];

export const validateUpdateUser = [
    expressvalidator.oneOf(
        [
          expressvalidator.body('username').exists({ values: 'falsy'}),
          expressvalidator.body('email').exists({ values: 'falsy' }),
          expressvalidator.body('password').exists({ values: 'falsy' }),
        ],
        {
          message:
            'At least one field (username, email, password) must be provided',
        },
      ),
    
    expressvalidator.body(`email`)
    .optional()
    .isEmail()
    .withMessage('email is not valid')
    .normalizeEmail(),

    expressvalidator.body('password')
    .optional()
    .isLength({min: 8, max: 64})
    .withMessage('password must contain at least 8 and at most 64 characters'),

    handleValidationErrors.handleValidationErrors,
];

module.exports(validateUser, validateUpdateUser);