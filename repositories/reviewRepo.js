const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant.js');

async function createReview(restaurantId, reviewData) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return null;

    restaurant.reviews.push(reviewData);
    await restaurant.save();

    return restaurant.reviews[restaurant.reviews.length - 1];
}

async function getReviews(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId).select("reviews");
    if (!restaurant) return null;
    return restaurant.reviews || [];
}

async function getReviewById(restaurantId, reviewId) {
    const restaurant = await Restaurant.findById(restaurantId).select("reviews");
    if (!restaurant) return null;

    const review = restaurant.reviews.id(reviewId);
    return review || null;
}

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