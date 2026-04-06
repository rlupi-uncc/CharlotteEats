const reservationService = require("../../services/reservationService");
const Reservation = require("../../models/Reservation");
const Restaurant = require("../../models/Restaurant");
const reservationRepo = require("../../repositories/reservationRepo");

jest.mock("../../models/Reservation");
jest.mock("../../models/Restaurant");
jest.mock("../../repositories/reservationRepo");

describe("reservationService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReservation", () => {
    it("creates a reservation when restaurant exists", async () => {
      const userId = "user123";
      const restaurantId = "rest123";
      const reservationData = {
        reservationDate: "2026-04-10",
        reservationTime: "18:30",
        partySize: 4,
        specialRequests: "Window seat",
      };

      Restaurant.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: restaurantId, name: "Pizza Place" }),
        }),
      });

      reservationRepo.createReservation.mockResolvedValue({
        _id: "res123",
        userId,
        restaurantId,
        ...reservationData,
        status: "booked",
      });

      const result = await reservationService.createReservation(
        userId,
        restaurantId,
        reservationData
      );

      expect(reservationRepo.createReservation).toHaveBeenCalledWith({
        userId,
        restaurantId,
        reservationDate: "2026-04-10",
        reservationTime: "18:30",
        partySize: 4,
        specialRequests: "Window seat",
        status: "booked",
      });

      expect(result.status).toBe("booked");
    });

    it("throws 404 when restaurant does not exist", async () => {
      Restaurant.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        reservationService.createReservation("user123", "badRest", {
          reservationDate: "2026-04-10",
          reservationTime: "18:30",
          partySize: 2,
        })
      ).rejects.toMatchObject({
        message: "Restaurant not found",
        status: 404,
      });
    });
  });

  describe("getReservationsForUser", () => {
    it("returns reservations for a user", async () => {
      const reservations = [{ _id: "r1" }, { _id: "r2" }];
      reservationRepo.getReservationsByUserId.mockResolvedValue(reservations);

      const result = await reservationService.getReservationsForUser("user123");

      expect(reservationRepo.getReservationsByUserId).toHaveBeenCalledWith("user123");
      expect(result).toEqual(reservations);
    });
  });

  describe("cancelReservation", () => {
    it("sets reservation status to cancelled for the owner", async () => {
      const save = jest.fn().mockResolvedValue();
      const toObject = jest.fn().mockReturnValue({
        _id: "res123",
        status: "cancelled",
      });

      Reservation.findById.mockResolvedValue({
        _id: "res123",
        userId: "user123",
        status: "booked",
        save,
        toObject,
      });

      const result = await reservationService.cancelReservation("user123", "res123");

      expect(save).toHaveBeenCalled();
      expect(result.status).toBe("cancelled");
    });

    it("throws 404 if reservation is missing", async () => {
      Reservation.findById.mockResolvedValue(null);

      await expect(
        reservationService.cancelReservation("user123", "badId")
      ).rejects.toMatchObject({
        message: "Reservation not found",
        status: 404,
      });
    });

    it("throws 403 if user does not own reservation", async () => {
      Reservation.findById.mockResolvedValue({
        _id: "res123",
        userId: "otherUser",
      });

      await expect(
        reservationService.cancelReservation("user123", "res123")
      ).rejects.toMatchObject({
        message: "Forbidden",
        status: 403,
      });
    });
  });

  describe("deleteReservation", () => {
    it("deletes reservation for the owner", async () => {
      const deleteOne = jest.fn().mockResolvedValue();

      Reservation.findById.mockResolvedValue({
        _id: "res123",
        userId: "user123",
        deleteOne,
      });

      const result = await reservationService.deleteReservation("user123", "res123");

      expect(deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });

    it("throws 404 if reservation is missing", async () => {
      Reservation.findById.mockResolvedValue(null);

      await expect(
        reservationService.deleteReservation("user123", "badId")
      ).rejects.toMatchObject({
        message: "Reservation not found",
        status: 404,
      });
    });

    it("throws 403 if user does not own reservation", async () => {
      Reservation.findById.mockResolvedValue({
        _id: "res123",
        userId: "someoneElse",
      });

      await expect(
        reservationService.deleteReservation("user123", "res123")
      ).rejects.toMatchObject({
        message: "Forbidden",
        status: 403,
      });
    });
  });
});