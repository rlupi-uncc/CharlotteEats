require("dotenv").config();
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

function computeRating(reviews) {
  if (!reviews || reviews.length === 0) return { ratingAvg: 0, ratingCount: 0 };
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;
  return { ratingAvg: Math.round(avg * 10) / 10, ratingCount: reviews.length };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const ownerId = new mongoose.Types.ObjectId("69d567942866360fbd56b8c9");

  // avoid duplicates if you run it multiple times
  await Restaurant.deleteMany({ name: "Le Jardin de Charlotte" });

  const reviews = [
    {
      userId: new mongoose.Types.ObjectId(),
      authorName: "Sophie M.",
      rating: 5,
      title: "Elegant and delicious",
      body: "The coq au vin was incredible and the atmosphere felt authentically French."
    },
    {
      userId: new mongoose.Types.ObjectId(),
      authorName: "Daniel R.",
      rating: 4,
      title: "Great date night spot",
      body: "Loved the onion soup and crème brûlée. Service was a little slow but very friendly."
    }
  ];

  const { ratingAvg, ratingCount } = computeRating(reviews);

  const restaurant = await Restaurant.create({
    ownerId,
    name: "Le Jardin de Charlotte",
    description: "A charming French bistro serving classic dishes, fine desserts, and curated wines.",
    tags: ["french", "bistro", "romantic", "fine-dining"],

    address: {
      line1: "214 Tryon St",
      city: "Charlotte",
      state: "NC",
      zip: "28202"
    },
    phone: "704-555-3487",
    website: "https://example.com/le-jardin",

    menuItems: [
      {
        name: "French Onion Soup",
        description: "Rich beef broth topped with toasted baguette and melted gruyère.",
        price: 9.95,
        category: "Starters",
        tags: ["classic", "savory"],
        allergens: ["dairy", "gluten"]
      },
      {
        name: "Coq au Vin",
        description: "Braised chicken in red wine with mushrooms, onions, and herbs.",
        price: 24.5,
        category: "Entrees",
        tags: ["house-special", "traditional"],
        allergens: []
      },
      {
        name: "Croque Monsieur",
        description: "Toasted ham and gruyère sandwich with béchamel.",
        price: 14.25,
        category: "Lunch",
        tags: ["classic", "cafe"],
        allergens: ["dairy", "gluten"]
      },
      {
        name: "Crème Brûlée",
        description: "Vanilla custard with a caramelized sugar crust.",
        price: 8.5,
        category: "Desserts",
        tags: ["sweet", "classic"],
        allergens: ["dairy", "eggs"]
      }
    ],

    reviews,
    ratingAvg,
    ratingCount
  });

  console.log("Created restaurant:", restaurant._id.toString());
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});