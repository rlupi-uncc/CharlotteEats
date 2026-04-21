const { param, body } = require("express-validator");
const { handleValidationErrors } = require("./handleValidationErrors.js");

const validateRestaurantId = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("A Restaurant id is required.")
    .bail()
    .isMongoId()
    .withMessage("A Restaurant id must be a valid Mongo ObjectId."),
  handleValidationErrors,
];

const validateReservationId = [
  param("reservationId")
    .exists({ checkFalsy: true })
    .withMessage("A Reservation id is required.")
    .bail()
    .isMongoId()
    .withMessage("The Reservation id must be a valid Mongo ObjectId."),
  handleValidationErrors,
];

const validateCreateReservation = [
  body("reservationDate")
    .exists({ checkFalsy: true })
    .withMessage("A reservationDate is required.")
    .bail()
    .isISO8601()
    .withMessage("The reservationDate must be a valid date (YYYY-MM-DD)."),

  body("reservationTime")
    .exists({ checkFalsy: true })
    .withMessage("A reservationTime is required.")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("The reservationTime must be in HH:MM format."),

  body("partySize")
    .exists({ checkFalsy: true })
    .withMessage("A partySize is required.")
    .bail()
    .isInt({ min: 1, max: 20 })
    .withMessage("The partySize must be an integer between 1 and 20.")
    .toInt(),

  body("specialRequests")
    .optional()
    .isString()
    .withMessage("The specialRequests must be a string.")
    .trim()
    .isLength({ max: 500 })
    .withMessage("The specialRequests contain 500 or fewer characters."),

  handleValidationErrors,
];

module.exports = {
  validateRestaurantId,
  validateReservationId,
  validateCreateReservation,
};