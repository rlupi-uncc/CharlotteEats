const reservationController = require("../../controllers/reservationController");
const reservationService = require("../../services/reservationService");

jest.mock("../services/reservationService");

describe("reservationController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      params: { id: "rest123", reservationId: "res123" },
      body: {
        reservationDate: "2026-04-10",
        reservationTime: "18:30",
        partySize: 4,
        specialRequests: "Window seat",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("createReservationHandler returns 201 with created reservation", async () => {
    const createdReservation = { _id: "res123", status: "booked" };
    reservationService.createReservation.mockResolvedValue(createdReservation);

    await reservationController.createReservationHandler(req, res);

    expect(reservationService.createReservation).toHaveBeenCalledWith(
      "user123",
      "rest123",
      req.body
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdReservation);
  });

  it("getMyReservationsHandler returns 200 with reservations", async () => {
    const reservations = [{ _id: "r1" }, { _id: "r2" }];
    reservationService.getReservationsForUser.mockResolvedValue(reservations);

    await reservationController.getMyReservationsHandler(req, res);

    expect(reservationService.getReservationsForUser).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(reservations);
  });

  it("cancelReservationHandler returns 200 with updated reservation", async () => {
    const updated = { _id: "res123", status: "cancelled" };
    reservationService.cancelReservation.mockResolvedValue(updated);

    await reservationController.cancelReservationHandler(req, res);

    expect(reservationService.cancelReservation).toHaveBeenCalledWith("user123", "res123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it("deleteReservationHandler returns 204", async () => {
    reservationService.deleteReservation.mockResolvedValue({ deleted: true });

    await reservationController.deleteReservationHandler(req, res);

    expect(reservationService.deleteReservation).toHaveBeenCalledWith("user123", "res123");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});