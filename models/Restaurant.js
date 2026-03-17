const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    allergens: [{ type: String, trim: true, lowercase: true }],
    isAvailable: { type: Boolean, default: true }
  },
  { _id: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", trim: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String, trim: true, lowercase: true }],

    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" }
    },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },

    menuItems: { type: [MenuItemSchema], default: [] },

    reviews: { type: [ReviewSchema], default: [] },

    // cached rating for quick sorting/filtering
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

RestaurantSchema.index({ tags: 1 });
RestaurantSchema.index({ "menuItems.category": 1 });
RestaurantSchema.index({ "menuItems.allergens": 1 });
RestaurantSchema.index({ ratingAvg: -1 });

module.exports = mongoose.model("Restaurant", RestaurantSchema);
