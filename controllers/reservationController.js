const reservationService = require("../services/reservationService.js");

async function createReservationHandler(req, res) {
  const userId = req.user.id;
  const restaurantId = req.params.id;

  const created = await reservationService.createReservation(userId, restaurantId, req.body);
  res.status(201).json(created);
}

async function getMyReservationsHandler(req, res) {
  const userId = req.user.id;
  const reservations = await reservationService.getReservationsForUser(userId);
  res.status(200).json(reservations);
}

async function cancelReservationHandler(req, res) {
  const userId = req.user.id;
  const reservationId = req.params.reservationId;

  const updated = await reservationService.cancelReservation(userId, reservationId);
  res.status(200).json(updated);
}

module.exports = {
  createReservationHandler,
  getMyReservationsHandler,
  cancelReservationHandler,
};