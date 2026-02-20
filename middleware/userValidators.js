const handleValidationErrors = require("./handleValidationErrors.js");
const { body, oneOf } = require("express-validator");

const validateUser = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email is not valid")
    .normalizeEmail(),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6, max: 64 })
    .withMessage("password must contain at least 8 and at most 64 characters"),

  handleValidationErrors.handleValidationErrors,
];

const validateLogin = [
  body("email").exists({ checkFalsy: true }).isEmail().withMessage("email is not valid").normalizeEmail(),
  body("password").exists({ checkFalsy: true }).withMessage("password is required"),
  handleValidationErrors.handleValidationErrors,
];

const validateUpdateUser = [
  oneOf(
    [
      body("username").exists({ checkFalsy: true }),
      body("email").exists({ checkFalsy: true }),
      body("password").exists({ checkFalsy: true }),
    ],
    {
      message: "At least one field (username, email, password) must be provided",
    }
  ),

  body("email")
    .optional()
    .isEmail()
    .withMessage("email is not valid")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 8, max: 64 })
    .withMessage("password must contain at least 8 and at most 64 characters"),

  handleValidationErrors.handleValidationErrors,
];

module.exports = { validateUser, validateUpdateUser, validateLogin };