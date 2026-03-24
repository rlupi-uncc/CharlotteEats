const { param, body } = require("express-validator");
const { handleValidationErrors } = require("./handleValidationErrors.js");

const validateRestaurantId = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("Restaurant id is required")
    .bail()
    .isMongoId()
    .withMessage("Restaurant id must be a valid Mongo ObjectId"),
  handleValidationErrors,
];

const validateReservationId = [
  param("reservationId")
    .exists({ checkFalsy: true })
    .withMessage("Reservation id is required")
    .bail()
    .isMongoId()
    .withMessage("Reservation id must be a valid Mongo ObjectId"),
  handleValidationErrors,
];

const validateCreateReservation = [
  body("reservationDate")
    .exists({ checkFalsy: true })
    .withMessage("reservationDate is required")
    .bail()
    .isISO8601()
    .withMessage("reservationDate must be a valid date (YYYY-MM-DD)"),

  body("reservationTime")
    .exists({ checkFalsy: true })
    .withMessage("reservationTime is required")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("reservationTime must be in HH:MM format"),

  body("partySize")
    .exists({ checkFalsy: true })
    .withMessage("partySize is required")
    .bail()
    .isInt({ min: 1, max: 20 })
    .withMessage("partySize must be an integer between 1 and 20")
    .toInt(),

  body("specialRequests")
    .optional()
    .isString()
    .withMessage("specialRequests must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("specialRequests must be 500 characters or fewer"),

  handleValidationErrors,
];

module.exports = {
  validateRestaurantId,
  validateReservationId,
  validateCreateReservation,
};