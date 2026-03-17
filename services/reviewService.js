const reviewRepo = require("../repositories/reviewRepo.js");
const Restaurant = require("../models/Restaurant.js");
const User = require("../models/User.js");

/**
 * Recompute ratingCount and ratingAvg based on embedded reviews.
 * @param {object} restaurantDoc - Restaurant mongoose document
 * @returns restaurantDoc
 */
function recomputeRatings(restaurantDoc) {
  const reviews = restaurantDoc.reviews || [];
  const count = reviews.length;

  const avg =
    count === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;

  restaurantDoc.ratingCount = count;
  restaurantDoc.ratingAvg = Math.round(avg * 10) / 10;
  return restaurantDoc;
}

/**
 * Normalize review payload
 * @param {*} data - review payload
 * @returns normalized review
 */
function normalizeReviewInput(data) {
  const review = {
    authorName: data.authorName,
    rating: data.rating,
    title: data.title ?? "",
    body: data.body,
  };

  if (typeof review.authorName !== "string" || review.authorName.trim() === "") {
    const err = new Error("authorName is required");
    err.status = 400;
    throw err;
  }

  const ratingNum = Number(review.rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    const err = new Error("rating must be a number from 1 to 5");
    err.status = 400;
    throw err;
  }
  review.rating = ratingNum;

  if (typeof review.body !== "string" || review.body.trim() === "") {
    const err = new Error("body is required");
    err.status = 400;
    throw err;
  }

  if (typeof review.title !== "string") {
    review.title = "";
  }

  return review;
}

/**
 * Create review and update restaurant ratings
 * @param {ObjectId|string} restaurantId
 * @param {ObjectId|string} userId
 * @param {*} reviewData
 * @returns created review subdoc
 */
async function createReview(restaurantId, userId, reviewData) {
  // lookup username
  const user = await User.findById(userId).select("username").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 401;
    throw err;
  }

  // normalize/validate, but force authorName from DB
  const normalized = normalizeReviewInput({
    ...reviewData,
    authorName: user.username,
  });
  normalized.userId = userId;

  // create embedded review
  const createdReview = await reviewRepo.createReview(restaurantId, normalized);
  if (!createdReview) {
    const err = new Error("Restaurant not found");
    err.status = 404;
    throw err;
  }

  // recompute cached ratings
  const restaurantDoc = await Restaurant.findById(restaurantId);
  if (!restaurantDoc) {
    const err = new Error("Restaurant not found after review creation");
    err.status = 404;
    throw err;
  }

  recomputeRatings(restaurantDoc);
  await restaurantDoc.save();

  return createdReview;
}

/**
 * Read all reviews for a given restaurant
 */
async function getReviews(restaurantId) {
  const reviews = await reviewRepo.getReviews(restaurantId);
  if (reviews === null) {
    const err = new Error("Restaurant not found");
    err.status = 404;
    throw err;
  }
  return reviews;
}

/**
 * Read single review by reviewId
 */
async function getReviewById(restaurantId, reviewId) {
  const review = await reviewRepo.getReviewById(restaurantId, reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.status = 404;
    throw err;
  }
  return review;
}

/**
 * Update review by reviewId
 * NOTE: authorName cannot be updated
 */
async function updateReview(restaurantId, reviewId, updatedData) {
  const patch = { ...updatedData };

  // Do NOT allow authorName changes (security + consistency)
  if ("authorName" in patch) delete patch.authorName;

  if (patch.rating !== undefined) {
    const ratingNum = Number(patch.rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      const err = new Error("rating must be a number from 1 to 5");
      err.status = 400;
      throw err;
    }
    patch.rating = ratingNum;
  }

  if (patch.title !== undefined && typeof patch.title !== "string") {
    const err = new Error("title must be a string");
    err.status = 400;
    throw err;
  }

  if (patch.body !== undefined) {
    if (typeof patch.body !== "string" || patch.body.trim() === "") {
      const err = new Error("body cannot be empty");
      err.status = 400;
      throw err;
    }
  }

  const updatedReview = await reviewRepo.updateReview(restaurantId, reviewId, patch);
  if (!updatedReview) {
    const err = new Error("Restaurant or review not found");
    err.status = 404;
    throw err;
  }

  const restaurantDoc = await Restaurant.findById(restaurantId);
  if (!restaurantDoc) {
    const err = new Error("Restaurant not found after review update");
    err.status = 404;
    throw err;
  }

  recomputeRatings(restaurantDoc);
  await restaurantDoc.save();

  return updatedReview;
}

/**
 * Delete review by reviewId
 */
async function deleteReview(restaurantId, reviewId, userId) {
  const deleted = await reviewRepo.deleteReview(restaurantId, reviewId, userId);
  if (!deleted) {
    const err = new Error("Restaurant or review not found");
    err.status = 404;
    throw err;
  }

  const restaurantDoc = await Restaurant.findById(restaurantId);
  if (!restaurantDoc) {
    const err = new Error("Restaurant not found after review delete");
    err.status = 404;
    throw err;
  }

  recomputeRatings(restaurantDoc);
  await restaurantDoc.save();

  return { deleted: true };
}

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};