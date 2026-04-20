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

async function getMyReservationsPageHandler(req, res) {
  const userId = req.user.id;
  const reservations = await reservationService.getReservationsForUser(userId);
  return res.render("reservations", { reservations });
}

async function cancelReservationHandler(req, res) {
  const userId = req.user.id;
  const reservationId = req.params.reservationId;

  const updated = await reservationService.cancelReservation(userId, reservationId);
  res.status(200).json(updated);
}

async function deleteReservationHandler(req, res) {
  const userId = req.user.id;
  const reservationId = req.params.reservationId;

  await reservationService.deleteReservation(userId, reservationId);
  res.status(204).send();
}

module.exports = {
  createReservationHandler,
  getMyReservationsHandler,
  getMyReservationsPageHandler,
  cancelReservationHandler,
  deleteReservationHandler,
};