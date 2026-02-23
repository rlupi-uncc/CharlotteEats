const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant.js');

/**
 * Create a review
 * @param {ObjectId} restaurantId 
 * @param {*} reviewData - includes authorName, rating, title, body
 * @returns newly created review subdoc
 */
async function createReview(restaurantId, reviewData) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return null;

    restaurant.reviews.push(reviewData);
    await restaurant.save();

    return restaurant.reviews[restaurant.reviews.length - 1];
}

/**
 * Retrieve all reviews
 * @param {OnbjectId} restaurantId 
 * @returns [] if no reviews or null if restaurant not found
 */
async function getReviews(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId).select("reviews");
    if (!restaurant) return null;
    return restaurant.reviews || [];
}

/**
 * Retrieve single review by reviewId
 * @param {ObjectId} restaurantId 
 * @param {ObjectId} reviewId 
 * @returns null if restaurant not found or review not found
 */
async function getReviewById(restaurantId, reviewId) {
    const restaurant = await Restaurant.findById(restaurantId).select("reviews");
    if (!restaurant) return null;

    const review = restaurant.reviews.id(reviewId);
    return review || null;
}

/**
 * Update a specific review
 * @param {ObjectId} restaurantId 
 * @param {ObjectId} reviewId 
 * @param {*} updatedData - includes optional authorName, rating, title, body
 * @returns the updated review subdoc, or null if restaurant/review not found
 */
async function updateReview(restaurantId, reviewId, updatedData) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return null;

    const review = restaurant.reviews.id(reviewId);
    if (!review) return null;

    if (updatedData.authorName !== undefined) review.authorName = updatedData.authorName;
    if (updatedData.rating !== undefined) review.rating = updatedData.rating;
    if (updatedData.title !== undefined) review.title = updatedData.title;
    if (updatedData.body !== undefined) review.body = updatedData.body;
    
    await restaurant.save();
    return review;
}

/**
 * Delete a specific review
 * @param {ObjectId} restaurantId 
 * @param {ObjectId} reviewId 
 * @returns true if deleted, false if restaurant/review not found
 */
async function deleteReview(restaurantId, reviewId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return false;

    const review = restaurant.reviews.id(reviewId);
    if (!review) return false;

    review.deleteOne();
    await restaurant.save();
    return true;
}

module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
};