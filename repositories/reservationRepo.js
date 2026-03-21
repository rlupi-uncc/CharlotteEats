const Reservation = require("../models/Reservation.js");

async function createReservation(reservationData) {
  return Reservation.create(reservationData);
}

async function getReservationsByUserId(userId) {
  return Reservation.find({ userId })
    .populate("restaurantId", "name")
    .sort({ reservationDate: 1, reservationTime: 1 })
    .lean();
}

async function getReservationById(reservationId) {
  return Reservation.findById(reservationId).lean();
}

async function deleteReservation(reservationId) {
  return Reservation.findByIdAndDelete(reservationId);
}

module.exports = {
  createReservation,
  getReservationsByUserId,
  getReservationById,
  deleteReservation,
};