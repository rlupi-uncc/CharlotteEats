const express = require("express");
const Restaurant = require("../models/Restaurant");
const router = express.Router();

// Mount for review routers
const reviewRoutes = require('./reviewRoutes.js');
router.use('/:id/reviews', reviewRoutes);

function applyMenuFilters(menuItems, { category, q, exclude, minPrice, maxPrice }) {
  return menuItems.filter((i) => {
    if (category && (i.category || '').toLowerCase() !== category) return false;

    if (q) {
      const hay = [
        i.name,
        i.description,
        i.category,
        ...(i.tags || [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!hay.includes(q)) return false;
    }

    if (exclude.length) {
      const allergens = (i.allergens || []).map((a) => a.toLowerCase());
      if (exclude.some((a) => allergens.includes(a))) return false;
    }

    if (minPrice !== null && !isNaN(minPrice) && i.price < minPrice) return false;
    if (maxPrice !== null && !isNaN(maxPrice) && i.price > maxPrice) return false;

    return true;
  });
}

// List restaurants with optional search, tag filter, and sorting
// GET /restaurants
// Query: ?q=&tag=&sort=rating|name|newest
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const tag = (req.query.tag || "").trim().toLowerCase();
  const sort = (req.query.sort || "rating").trim().toLowerCase();

  const all = await Restaurant.find({})
    .select("name description tags address ratingAvg ratingCount createdAt")
    .lean();

  let restaurants = all;

  if (q) {
    restaurants = restaurants.filter((r) => {
      const hay = [
        r.name,
        r.description,
        ...(r.tags || []),
        r.address?.city,
        r.address?.state
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }

  if (tag) {
    restaurants = restaurants.filter((r) =>
      (r.tags || []).map((t) => t.toLowerCase()).includes(tag)
    );
  }

  if (sort === "name") {
    restaurants.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sort === "newest") {
    restaurants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    restaurants.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
  }

  const allTags = Array.from(
    new Set(all.flatMap((r) => (r.tags || []).map((t) => t.toLowerCase())))
  ).sort();

  res.render("restaurants", {
    restaurants,
    allTags,
    filters: {
      q: req.query.q || "",
      tag: req.query.tag || "",
      sort: req.query.sort || "rating"
    }
  });
});
// Individual restaurant page with menu and reviews
// GET /restaurants/:id
// Query: ?q=&category=&excludeAllergens=peanuts,dairy&minPrice=&maxPrice=
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const q = (req.query.q || "").toLowerCase();
  const category = (req.query.category || "").toLowerCase();
  const exclude = (req.query.excludeAllergens || "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

  const restaurant = await Restaurant.findById(id).lean();
  if (!restaurant) return res.status(404).send("Restaurant not found");

  let menuItems = applyMenuFilters(restaurant.menuItems || [], {
    category,
    q,
    exclude,
    minPrice,
    maxPrice
  });

  const categories = Array.from(
    new Set((restaurant.menuItems || []).map((i) => i.category).filter(Boolean))
  ).sort();

  const reviews = (restaurant.reviews || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render("restaurant", {
    restaurant,
    menuItems,
    categories,
    reviews,
    filters: {
      q: req.query.q || "",
      category: req.query.category || "",
      excludeAllergens: req.query.excludeAllergens || "",
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || ""
    }
  });
});

module.exports = router;
