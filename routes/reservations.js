const express = require("express");
const router = express.Router({ mergeParams: true });

const reservationController = require("../controllers/reservationController.js");
const { requireAuth } = require("../middleware/requireAuth");
const {
  validateRestaurantId,
  validateReservationId,
  validateCreateReservation,
} = require("../middleware/reservationValidators.js");

router.use(requireAuth);

router.post(
  "/",
  validateRestaurantId,
  validateCreateReservation,
  reservationController.createReservationHandler
);

router.get("/my", reservationController.getMyReservationsHandler);

router.put(
  "/:reservationId/cancel",
  validateRestaurantId,
  validateReservationId,
  reservationController.cancelReservationHandler
);

router.delete(
  "/:reservationId",
  validateRestaurantId,
  validateReservationId,
  reservationController.deleteReservationHandler
);

module.exports = router;