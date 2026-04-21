const request = require("supertest");
const express = require("express");

jest.mock("../../models/Restaurant", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../middleware/requireAuth", () => ({
  requireAuth: (req, res, next) => {
    if (!req.headers["x-test-user-id"]) {
      return res.status(401).send("Unauthorized");
    }

    req.user = {
      id: req.headers["x-test-user-id"],
      role: req.headers["x-test-user-role"] || "user",
    };

    next();
  },
}));

jest.mock("../../middleware/requireRestaurantOwner", () => ({
  requireRestaurantOwner: (req, res, next) => {
    const ownerId = req.headers["x-test-owner-id"];
    const currentUserId = req.headers["x-test-user-id"];
    const currentUserRole = req.headers["x-test-user-role"] || "user";

    if (!ownerId) {
      return res.status(404).send("Restaurant not found");
    }

    if (currentUserRole === "admin" || ownerId === currentUserId) {
      return next();
    }

    return res.status(403).send("Forbidden");
  },
}));

const Restaurant = require("../../models/Restaurant");
const restaurantRoutes = require("../../routes/restaurant");

describe("Restaurant owner routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.set("view engine", "ejs");

    // mock render to return JSON so we can assert view + data
    app.response.render = function (view, locals) {
      return this.status(200).json({ view, locals });
    };

    app.use("/restaurants", restaurantRoutes);

    jest.clearAllMocks();
  });

  describe("GET /restaurants/:id/edit", () => {
    test("allows owner to access edit page", async () => {
      Restaurant.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "rest1",
          name: "Test Restaurant",
          description: "Desc",
          tags: ["pizza"],
          address: { line1: "123 Main", city: "Charlotte", state: "NC", zip: "28202" },
          phone: "1234567890",
          website: "https://example.com",
          menuItems: [],
        }),
      });

      const res = await request(app)
        .get("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1");

      expect(res.status).toBe(200);
      expect(res.body.view).toBe("editRestaurant");
      expect(res.body.locals.restaurant.name).toBe("Test Restaurant");
    });

    test("returns 401 for unauthenticated user", async () => {
      const res = await request(app).get("/restaurants/rest1/edit");

      expect(res.status).toBe(401);
      expect(res.text).toBe("Unauthorized");
    });

    test("returns 403 for non-owner", async () => {
      const res = await request(app)
        .get("/restaurants/rest1/edit")
        .set("x-test-user-id", "user2")
        .set("x-test-owner-id", "owner1");

      expect(res.status).toBe(403);
      expect(res.text).toBe("Forbidden");
    });

    test("returns 404 when restaurant does not exist", async () => {
      const res = await request(app)
        .get("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Restaurant not found");
    });
  });

  describe("POST /restaurants/:id/edit", () => {
    const updatePayload = {
      name: "Updated Name",
      description: "Updated Description",
      tags: "pizza, italian",
      line1: "456 Elm",
      city: "Charlotte",
      state: "NC",
      zip: "28203",
      phone: "5551234567",
      website: "https://updated.com",
    };

    test("allows owner to update restaurant", async () => {
      Restaurant.findByIdAndUpdate.mockResolvedValue({
        _id: "rest1",
        name: "Updated Name",
      });

      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .send(updatePayload);

      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        "rest1",
        {
          name: "Updated Name",
          description: "Updated Description",
          tags: ["pizza", "italian"],
          address: {
            line1: "456 Elm",
            city: "Charlotte",
            state: "NC",
            zip: "28203",
          },
          phone: "5551234567",
          website: "https://updated.com",
        },
        { new: true, runValidators: true }
      );

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/restaurants/rest1");
    });

    test("allows admin to update restaurant", async () => {
      Restaurant.findByIdAndUpdate.mockResolvedValue({
        _id: "rest1",
        name: "Updated Name",
      });

      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "admin1")
        .set("x-test-user-role", "admin")
        .set("x-test-owner-id", "owner1")
        .send(updatePayload);

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/restaurants/rest1");
    });

    test("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .send(updatePayload);

      expect(res.status).toBe(401);
      expect(res.text).toBe("Unauthorized");
    });

    test("returns 403 for non-owner", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "user2")
        .set("x-test-owner-id", "owner1")
        .send(updatePayload);

      expect(res.status).toBe(403);
      expect(res.text).toBe("Forbidden");
    });

    test("returns 404 if restaurant is missing during update", async () => {
      Restaurant.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.text).toBe("Restaurant not found");
    });

    test("passes trimmed/lowercased tag list correctly", async () => {
      Restaurant.findByIdAndUpdate.mockResolvedValue({
        _id: "rest1",
        name: "Updated Name",
      });

      await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .send({
          ...updatePayload,
          tags: "  Pizza, Italian ,  family-friendly ",
        });

      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        "rest1",
        expect.objectContaining({
          tags: ["pizza", "italian", "family-friendly"],
        }),
        { new: true, runValidators: true }
      );
    });

    test("handles database errors with 500", async () => {
      Restaurant.findByIdAndUpdate.mockRejectedValue(new Error("DB exploded"));

      const res = await request(app)
        .post("/restaurants/rest1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .send(updatePayload);

      expect(res.status).toBe(500);
    });
  });
});