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
  await Restaurant.deleteMany({ name: "El Camino Cantina" });

  const reviews = [
    {
      userId: new mongoose.Types.ObjectId(),
      authorName: "Luis G.",
      rating: 5,
      title: "Authentic and delicious",
      body: "The tacos were amazing and the salsa had the perfect kick. Felt very authentic.",
      likes: 9
    },
    {
      userId: new mongoose.Types.ObjectId(),
      authorName: "Amanda B.",
      rating: 4,
      title: "Great margaritas",
      body: "Loved the margaritas and queso dip. Atmosphere was fun and lively.",
      likes: 5
    },
    {
      userId: new mongoose.Types.ObjectId(),
      authorName: "Tyler H.",
      rating: 5,
      title: "Best tacos in town",
      body: "Street tacos were incredible. Quick service and really good prices.",
      likes: 6
    }
  ];

  const { ratingAvg, ratingCount } = computeRating(reviews);

  const restaurant = await Restaurant.create({
    name: "El Camino Cantina",
    description: "A vibrant Mexican cantina serving tacos, burritos, fresh guacamole, and handcrafted margaritas.",
    tags: ["mexican", "tacos", "casual", "margaritas", "family-friendly"],

    address: { line1: "800 South Blvd", city: "Charlotte", state: "NC", zip: "28203" },
    phone: "704-555-6677",
    website: "https://example.com",

    menuItems: [
      {
        name: "Street Tacos",
        description: "Three corn tortillas filled with your choice of meat, topped with onion and cilantro.",
        price: 11.99,
        category: "Entrees",
        tags: ["tacos", "popular"],
        allergens: [],
        image: "https://images.unsplash.com/photo-1683062332605-4e1209d75346?q=80&w=2136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        name: "Chicken Quesadilla",
        description: "Grilled flour tortilla stuffed with chicken and cheese, served with sour cream and salsa.",
        price: 10.5,
        category: "Entrees",
        tags: ["cheesy", "favorite"],
        allergens: ["dairy", "gluten"],
        image: "https://images.unsplash.com/photo-1719957770167-bb66133ba808?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        name: "Chips & Queso",
        description: "Warm tortilla chips served with creamy queso dip.",
        price: 6.99,
        category: "Appetizers",
        tags: ["shareable"],
        allergens: ["dairy"],
        image: "https://images.unsplash.com/photo-1638992147921-f054a9829b96?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        name: "Carne Asada Burrito",
        description: "Flour tortilla filled with grilled steak, rice, beans, and pico de gallo.",
        price: 12.99,
        category: "Entrees",
        tags: ["burrito", "hearty"],
        allergens: ["gluten"],
        image: "https://images.unsplash.com/photo-1731090389603-d63060ee08a6?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        name: "Churros",
        description: "Fried dough tossed in cinnamon sugar, served with chocolate dipping sauce.",
        price: 5.99,
        category: "Desserts",
        tags: ["sweet"],
        allergens: ["gluten", "dairy"],
        image: "https://plus.unsplash.com/premium_photo-1713687794966-caff63572085?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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