const Reservation = require("../models/Reservation.js");
const Restaurant = require("../models/Restaurant.js");
const reservationRepo = require("../repositories/reservationRepo.js");

async function createReservation(userId, restaurantId, reservationData) {
  const restaurant = await Restaurant.findById(restaurantId).select("_id name").lean();
  if (!restaurant) {
    const err = new Error("Restaurant not found");
    err.status = 404;
    throw err;
  }

  const reservation = await reservationRepo.createReservation({
    userId,
    restaurantId,
    reservationDate: reservationData.reservationDate,
    reservationTime: reservationData.reservationTime,
    partySize: reservationData.partySize,
    specialRequests: reservationData.specialRequests ?? "",
    status: "booked",
  });

  return reservation;
}

async function getReservationsForUser(userId) {
  return reservationRepo.getReservationsByUserId(userId);
}

async function cancelReservation(userId, reservationId) {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    const err = new Error("Reservation not found");
    err.status = 404;
    throw err;
  }

  if (String(reservation.userId) !== String(userId)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  reservation.status = "cancelled";
  await reservation.save();
  return reservation.toObject();
}

module.exports = {
  createReservation,
  getReservationsForUser,
  cancelReservation,
};