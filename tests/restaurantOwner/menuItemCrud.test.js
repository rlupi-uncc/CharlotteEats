const request = require("supertest");
const express = require("express");
const DEFAULT_MENU_IMAGE =
  "https://images.unsplash.com/vector-1769004080108-6c81a96475df?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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

describe("Menu item CRUD owner routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use("/restaurants", restaurantRoutes);

    jest.clearAllMocks();
  });

  function makeRestaurantDoc({ withMenuItem = true } = {}) {
    const item = withMenuItem
      ? {
          _id: "item1",
          name: "Burger",
          description: "Tasty",
          price: 12.5,
          category: "Entree",
          tags: ["beef"],
          allergens: ["dairy"],
          isAvailable: true,
          image: "https://example.com/burger.jpg",
          deleteOne: jest.fn(),
        }
      : null;

    const menuItems = withMenuItem ? [item] : [];

    menuItems.id = jest.fn((id) => {
      return menuItems.find((x) => String(x._id) === String(id)) || null;
    });

    return {
      _id: "rest1",
      menuItems,
      save: jest.fn().mockResolvedValue(true),
    };
  }

  describe("POST /restaurants/:id/menu-items", () => {
    test("allows owner to add a menu item", async () => {
      const restaurantDoc = makeRestaurantDoc({ withMenuItem: false });
      restaurantDoc.menuItems.push = jest.fn(function (item) {
        Array.prototype.push.call(this, item);
      });

      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const payload = {
        name: "Fries",
        description: "Crispy fries",
        price: "4.99",
        category: "Sides",
        tags: "potato, fried",
        allergens: "none",
        isAvailable: "on",
        image: "https://example.com/fries.jpg",
      };

      const res = await request(app)
        .post("/restaurants/rest1/menu-items")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send(payload);

      expect(Restaurant.findById).toHaveBeenCalledWith("rest1");
      expect(restaurantDoc.menuItems.push).toHaveBeenCalledWith({
        name: "Fries",
        description: "Crispy fries",
        price: 4.99,
        category: "Sides",
        tags: ["potato", "fried"],
        allergens: ["none"],
        isAvailable: true,
        image: "https://example.com/fries.jpg",
      });
      expect(restaurantDoc.save).toHaveBeenCalled();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/restaurants/rest1/edit");
    });

    test("uses fallback values when optional fields are missing", async () => {
      const restaurantDoc = makeRestaurantDoc({ withMenuItem: false });
      restaurantDoc.menuItems.push = jest.fn(function (item) {
        Array.prototype.push.call(this, item);
      });

      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Tea",
          price: "2.50",
          category: "Drinks",
        });

      expect(restaurantDoc.menuItems.push).toHaveBeenCalledWith({
        name: "Tea",
        description: "",
        price: 2.5,
        category: "Drinks",
        tags: [],
        allergens: [],
        isAvailable: false,
        image: DEFAULT_MENU_IMAGE,
      });
      expect(res.status).toBe(302);
    });

    test("returns 401 for unauthenticated add", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items")
        .type("form")
        .send({
          name: "Tea",
          price: "2.50",
          category: "Drinks",
        });

      expect(res.status).toBe(401);
      expect(res.text).toBe("Unauthorized");
    });

    test("returns 403 for non-owner add", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items")
        .set("x-test-user-id", "user2")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Tea",
          price: "2.50",
          category: "Drinks",
        });

      expect(res.status).toBe(403);
      expect(res.text).toBe("Forbidden");
    });

    test("returns 404 when restaurant does not exist on add", async () => {
      Restaurant.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Tea",
          price: "2.50",
          category: "Drinks",
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Restaurant not found");
    });
  });

  describe("POST /restaurants/:id/menu-items/:menuItemId/edit", () => {
    test("allows owner to edit a menu item", async () => {
      const restaurantDoc = makeRestaurantDoc();
      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Updated Burger",
          description: "Even tastier",
          price: "14.00",
          category: "Entree",
          tags: "beef, grilled",
          allergens: "dairy, gluten",
          isAvailable: "on",
          image: "https://example.com/updated-burger.jpg",
        });

      const item = restaurantDoc.menuItems[0];

      expect(item.name).toBe("Updated Burger");
      expect(item.description).toBe("Even tastier");
      expect(item.price).toBe(14);
      expect(item.category).toBe("Entree");
      expect(item.tags).toEqual(["beef", "grilled"]);
      expect(item.allergens).toEqual(["dairy", "gluten"]);
      expect(item.isAvailable).toBe(true);
      expect(item.image).toBe("https://example.com/updated-burger.jpg");
      expect(restaurantDoc.save).toHaveBeenCalled();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/restaurants/rest1/edit");
    });

    test("sets unchecked availability to false on edit", async () => {
      const restaurantDoc = makeRestaurantDoc();
      Restaurant.findById.mockResolvedValue(restaurantDoc);

      await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Updated Burger",
          description: "Even tastier",
          price: "14.00",
          category: "Entree",
          tags: "",
          allergens: "",
          image: DEFAULT_MENU_IMAGE,
        });

      expect(restaurantDoc.menuItems[0].isAvailable).toBe(false);
    });

    test("returns 404 when restaurant missing on edit", async () => {
      Restaurant.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Updated Burger",
          price: "14.00",
          category: "Entree",
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Restaurant not found");
    });

    test("returns 404 when menu item missing on edit", async () => {
      const restaurantDoc = makeRestaurantDoc({ withMenuItem: false });
      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Updated Burger",
          price: "14.00",
          category: "Entree",
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Menu item not found");
    });

    test("returns 403 for non-owner edit", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .set("x-test-user-id", "user2")
        .set("x-test-owner-id", "owner1")
        .type("form")
        .send({
          name: "Updated Burger",
          price: "14.00",
          category: "Entree",
        });

      expect(res.status).toBe(403);
      expect(res.text).toBe("Forbidden");
    });

    test("returns 401 for unauthenticated edit", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/edit")
        .type("form")
        .send({
          name: "Updated Burger",
          price: "14.00",
          category: "Entree",
        });

      expect(res.status).toBe(401);
      expect(res.text).toBe("Unauthorized");
    });
  });

  describe("POST /restaurants/:id/menu-items/:menuItemId/delete", () => {
    test("allows owner to delete a menu item", async () => {
      const restaurantDoc = makeRestaurantDoc();
      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/delete")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1");

      expect(restaurantDoc.menuItems[0].deleteOne).toHaveBeenCalled();
      expect(restaurantDoc.save).toHaveBeenCalled();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/restaurants/rest1/edit");
    });

    test("returns 404 when restaurant missing on delete", async () => {
      Restaurant.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/delete")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Restaurant not found");
    });

    test("returns 404 when menu item missing on delete", async () => {
      const restaurantDoc = makeRestaurantDoc({ withMenuItem: false });
      Restaurant.findById.mockResolvedValue(restaurantDoc);

      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/delete")
        .set("x-test-user-id", "owner1")
        .set("x-test-owner-id", "owner1");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Menu item not found");
    });

    test("returns 403 for non-owner delete", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/delete")
        .set("x-test-user-id", "user2")
        .set("x-test-owner-id", "owner1");

      expect(res.status).toBe(403);
      expect(res.text).toBe("Forbidden");
    });

    test("returns 401 for unauthenticated delete", async () => {
      const res = await request(app)
        .post("/restaurants/rest1/menu-items/item1/delete");

      expect(res.status).toBe(401);
      expect(res.text).toBe("Unauthorized");
    });
  });
});