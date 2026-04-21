const handleValidationErrors = require("./handleValidationErrors.js");
const { body, oneOf } = require("express-validator");

const validateUser = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("An email is required.")
    .bail()
    .isEmail()
    .withMessage("The email entered is not a valid email.")
    .normalizeEmail(),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("A password is required.")
    .bail()
    .isLength({ min: 6, max: 64 })
    .withMessage("The password must contain at least 8 and at most 64 characters."),

  handleValidationErrors.handleValidationErrors,
];

const validateLogin = [
  body("email").exists({ checkFalsy: true }).isEmail().withMessage("The email entered is not a valid email.").normalizeEmail(),
  body("password").exists({ checkFalsy: true }).withMessage("A password is required."),
  handleValidationErrors.handleValidationErrors,
];

const validateUpdateUser = [
  oneOf(
    [
      body("name").exists({ checkFalsy: true }),
      body("email_change").exists({ checkFalsy: true }),
      body("password").exists({ checkFalsy: true }),
    ],
    {
      message: "At least one field (username, email, password) must be provided.",
    }
  ),

  body("email_change")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("The email entered is not a valid email.")
    .normalizeEmail(),

  body("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 64 })
    .withMessage("The password must contain at least 8 and at most 64 characters."),

  handleValidationErrors.handleValidationErrors,
];

module.exports = { validateUser, validateUpdateUser, validateLogin };