const express = require("express");
const Restaurant = require("../models/Restaurant");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRestaurantOwner } = require("../middleware/requireRestaurantOwner");
const router = express.Router();

// Mount for review routers
const reviewRoutes = require("./reviewRoutes.js");
router.use("/:id/reviews", reviewRoutes);

// Helper functions for filtering and normalizing tags
const TAG_ALIASES = {
  hala: 'halal',
  halal: 'halal',
  'gluten free': 'gluten-free',
  'gluten-free': 'gluten-free',
  'nut free': 'nut-free',
  'nut-free': 'nut-free',
  keto: 'keto',
  vegan: 'vegan',
  vegetarian: 'vegetarian'
};

function normalizeTag(value) {
  return (value || '').toString().trim().toLowerCase().replace(/\s+/g, '-');
}

// Convert user input tag to canonical form for consistent filtering
function canonicalTag(value) {
  const tag = normalizeTag(value);
  return TAG_ALIASES[tag] || tag;
}

function applyMenuFilters(menuItems, { category, q, dietTag, exclude, minPrice, maxPrice }) {
  return menuItems.filter((i) => {
    if (category && (i.category || "").toLowerCase() !== category) return false;

    if (q) {
      const hay = [i.name, i.description, i.category, ...(i.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!hay.includes(q)) return false;
    }

    if (dietTag) {
      const itemTags = (i.tags || []).map(canonicalTag);
      if (!itemTags.includes(canonicalTag(dietTag))) return false;
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

// List restaurants
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
        r.address?.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }

  if (tag) {
    const canonicalQueryTag = canonicalTag(tag);
    restaurants = restaurants.filter((r) =>
      (r.tags || []).map(canonicalTag).includes(canonicalQueryTag)
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
      sort: req.query.sort || "rating",
    },
  });
});

// Individual restaurant page
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const q = (req.query.q || "").toLowerCase();
  const category = (req.query.category || "").toLowerCase();
  const dietTag = (req.query.dietTag || "").trim().toLowerCase();
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
    dietTag,
    exclude,
    minPrice,
    maxPrice,
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
    currentUser: req.user || null,    filters: {
      q: req.query.q || "",
      category: req.query.category || "",
      dietTag: req.query.dietTag || "",
      excludeAllergens: req.query.excludeAllergens || "",
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || "",
    },
  });
});

// Render edit page - owner only
router.get("/:id/edit", requireAuth, requireRestaurantOwner, async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) return res.status(404).send("Restaurant not found");

  res.render("editRestaurant", { restaurant });
});

// Update restaurant - owner only
router.post("/:id/edit", requireAuth, requireRestaurantOwner, async (req, res, next) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        tags: (req.body.tags || "")
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        address: {
          line1: req.body.line1 || "",
          city: req.body.city || "",
          state: req.body.state || "",
          zip: req.body.zip || "",
        },
        phone: req.body.phone || "",
        website: req.body.website || "",
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).send("Restaurant not found");

    res.redirect(`/restaurants/${updated._id}`);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/menu-items", requireAuth, requireRestaurantOwner, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).send("Restaurant not found");

    restaurant.menuItems.push({
      name: req.body.name,
      description: req.body.description || "",
      price: Number(req.body.price),
      category: req.body.category,
      tags: (req.body.tags || "")
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(Boolean),
      allergens: (req.body.allergens || "")
        .split(",")
        .map(a => a.trim().toLowerCase())
        .filter(Boolean),
      isAvailable: req.body.isAvailable === "on",
      image: req.body.image || "https://images.unsplash.com/vector-1769004080108-6c81a96475df?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    });

    await restaurant.save();
    res.redirect(`/restaurants/${req.params.id}/edit`);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/menu-items/:menuItemId/edit", requireAuth, requireRestaurantOwner, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).send("Restaurant not found");

    const item = restaurant.menuItems.id(req.params.menuItemId);
    if (!item) return res.status(404).send("Menu item not found");

    item.name = req.body.name;
    item.description = req.body.description || "";
    item.price = Number(req.body.price);
    item.category = req.body.category;
    item.tags = (req.body.tags || "")
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);
    item.allergens = (req.body.allergens || "")
      .split(",")
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);
    item.isAvailable = req.body.isAvailable === "on";
    item.image = req.body.image || "https://images.unsplash.com/vector-1769004080108-6c81a96475df?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    await restaurant.save();
    res.redirect(`/restaurants/${req.params.id}/edit`);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/menu-items/:menuItemId/delete", requireAuth, requireRestaurantOwner, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).send("Restaurant not found");

    const item = restaurant.menuItems.id(req.params.menuItemId);
    if (!item) return res.status(404).send("Menu item not found");

    item.deleteOne();
    await restaurant.save();

    res.redirect(`/restaurants/${req.params.id}/edit`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;