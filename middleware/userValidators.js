import { handleValidationErrors } from './handleValidationErrors.js'
import { body, oneOf } from 'express-validator';

export const validateUser = [
    body(`email`)
    .exists({values: `false`})
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('email is not valid')
    .normalizeEmail(),

    body('password')
    .exists({values: 'false'})
    .withMessage('password is required')
    .bail()
    .isLength({min: 8, max: 64})
    .withMessage('password must contain at least 8 and at most 64 characters'),

    handleValidationErrors,
];

export const validateUpdateUser = [
    oneOf(
        [
          body('username').exists({ values: 'falsy'}),
          body('email').exists({ values: 'falsy' }),
          body('password').exists({ values: 'falsy' }),
        ],
        {
          message:
            'At least one field (username, email, password) must be provided',
        },
      ),
    
    body(`email`)
    .optional()
    .isEmail()
    .withMessage('email is not valid')
    .normalizeEmail(),

    body('password')
    .optional()
    .isLength({min: 8, max: 64})
    .withMessage('password must contain at least 8 and at most 64 characters'),

    handleValidationErrors,
];