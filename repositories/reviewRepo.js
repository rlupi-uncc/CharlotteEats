const Restaurant = require("../models/Restaurant.js");

/**
 * Create a review (embedded)
 * @param {ObjectId|string} restaurantId
 * @param {*} reviewData - includes authorName, rating, title, body
 * @returns newly created review as plain object
 */
async function createReview(restaurantId, reviewData) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return null;

  restaurant.reviews.push(reviewData);
  await restaurant.save();

  const created = restaurant.reviews[restaurant.reviews.length - 1];
  return created ? created.toObject() : null;
}

/**
 * Retrieve all reviews
 * @param {ObjectId|string} restaurantId
 * @returns [] if no reviews or null if restaurant not found
 */
async function getReviews(restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId).select("reviews").lean();
  if (!restaurant) return null;
  return restaurant.reviews || [];
}

/**
 * Retrieve single review by reviewId
 * @param {ObjectId|string} restaurantId
 * @param {ObjectId|string} reviewId
 * @returns review object or null
 */
async function getReviewById(restaurantId, reviewId) {
  const restaurant = await Restaurant.findById(restaurantId).select("reviews");
  if (!restaurant) return null;

  const review = restaurant.reviews.id(reviewId);
  return review ? review.toObject() : null;
}

/**
 * Update a specific review (embedded)
 * NOTE: authorName should not be updated (server-controlled)
 */
async function updateReview(restaurantId, reviewId, updatedData) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return null;

  const review = restaurant.reviews.id(reviewId);
  if (!review) return null;

  // authorName is intentionally NOT updated
  if (updatedData.rating !== undefined) review.rating = updatedData.rating;
  if (updatedData.title !== undefined) review.title = updatedData.title;
  if (updatedData.body !== undefined) review.body = updatedData.body;

  await restaurant.save();
  return review.toObject();
}

/**
 * Delete a specific review (embedded)
 * @returns true if deleted, false if restaurant/review not found
 */
async function deleteReview(restaurantId, reviewId, userId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const err = new Error("Restaurant not found");
      err.status = 404;
      throw err;
    }
  
    const review = restaurant.reviews.id(reviewId);
    if (!review) {
      const err = new Error("Review not found");
      err.status = 404;
      throw err;
    }
  
    if (!review.userId || String(review.userId) !== String(userId)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
  
    review.deleteOne();
    await restaurant.save();
  
    return true;
  }

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};