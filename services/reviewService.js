const reviewRepo = require('../repositories/reviewRepo.js');
const Restaurant = require('../models/Restaurant.js');

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

async function createReview(restaurantId, reviewData) {
    const normalized = normalizeReviewInput(reviewData);

    const createdReview = await reviewRepo.createReview(restaurantId, normalized);
    if (!createdReview) {
        const err = new Error("Restaurant not found");
        err.status = 404;
        throw err;
    }

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

async function getReviews(restaurantId) {
    const reviews = await reviewRepo.getReviews(restaurantId);
    if (reviews === null) {
        const err = new Error("Restaurant not found");
        err.status = 404;
        throw err;
    }
    return reviews;
}

async function getReviewById(restaurantId, reviewId) {
    const review = await reviewRepo.getReviewById(restaurantId, reviewId);
    if (!review) {
        const err = new Error("Review not found");
        err.status = 404;
        throw err;
    }
    return review;
}


async function updateReview(restaurantId, reviewId, updatedData) {
    const patch = { ...updatedData };

    if (patch.rating !== undefined) {
        const ratingNum = Number(patch.rating);
        if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            const err = new Error("rating must be a number from 1 to 5");
            err.status = 400;
            throw err;
        }
        patch.rating = ratingNum;
    }

    if (patch.authorName !== undefined) {
        if (typeof patch.authorName !== "string" || patch.authorName.trim() === "") {
            const err = new Error("authorName cannot be empty");
            err.status = 400;
            throw err;
        }
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

async function deleteReview(restaurantId, reviewId) {
    const deleted = await reviewRepo.deleteReview(restaurantId, reviewId);
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
