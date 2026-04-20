const Restaurant = require("../../models/Restaurant");
const { requireRestaurantOwner } = require("../../middleware/requireRestaurantOwner");

jest.mock("../../models/Restaurant");

describe("requireRestaurantOwner middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: "restaurant123" },
      user: { id: "user123", role: "user" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  test("calls next when user owns restaurant", async () => {
    Restaurant.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ownerId: "user123" }),
    });

    await requireRestaurantOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("calls next when user is admin", async () => {
    req.user = { id: "differentUser", role: "admin" };

    Restaurant.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ownerId: "owner456" }),
    });

    await requireRestaurantOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 403 when user is not owner", async () => {
    Restaurant.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ownerId: "owner456" }),
    });

    await requireRestaurantOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 404 when restaurant is not found", async () => {
    Restaurant.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await requireRestaurantOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Restaurant not found" });
    expect(next).not.toHaveBeenCalled();
  });

  test("passes errors to next", async () => {
    const err = new Error("DB failure");

    Restaurant.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(err),
    });

    await requireRestaurantOwner(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});