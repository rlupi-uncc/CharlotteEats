const Restaurant = require("../models/Restaurant.js");

async function requireRestaurantOwner(req, res, next) {
  try {
    const restaurantId = req.params.id;
    const userId = req.user.id;

    const restaurant = await Restaurant.findById(restaurantId).select("ownerId");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const isOwner = String(restaurant.ownerId) === String(userId);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.restaurant = restaurant;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireRestaurantOwner };