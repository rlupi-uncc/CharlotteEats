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

  // avoid duplicates if you run it multiple times
  await Restaurant.deleteMany({ name: "Smoky River BBQ" });

  const reviews = [
    {
      authorName: "Jordan K.",
      rating: 5,
      title: "Best pulled pork in town",
      body: "Super tender, great sauce options, and the sides were legit."
    },
    {
      authorName: "Alyssa P.",
      rating: 4,
      title: "Solid BBQ spot",
      body: "Brisket was great. A little busy at dinner but worth it."
    }
  ];

  const { ratingAvg, ratingCount } = computeRating(reviews);

  const restaurant = await Restaurant.create({
    name: "Smoky River BBQ",
    description: "Slow-smoked BBQ, classic sides, and house sauces.",
    tags: ["bbq", "family-friendly", "casual", "takeout"],

    address: { line1: "123 Main St", city: "Charlotte", state: "NC", zip: "28202" },
    phone: "704-555-1212",
    website: "https://example.com",

    menuItems: [
      {
        name: "Pulled Pork Plate",
        description: "Served with slaw and a side.",
        price: 13.99,
        category: "Entrees",
        tags: ["bbq", "house-special"],
        allergens: []
      },
      {
        name: "Mac & Cheese",
        description: "Creamy cheddar blend.",
        price: 4.99,
        category: "Sides",
        tags: ["vegetarian"],
        allergens: ["dairy", "gluten"]
      },
      {
        name: "Peanut Butter Pie",
        description: "Rich, sweet, and dense.",
        price: 6.5,
        category: "Desserts",
        tags: ["sweet"],
        allergens: ["peanuts", "dairy", "gluten"]
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
