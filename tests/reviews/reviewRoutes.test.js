const request = require("supertest");

// mock auth
jest.mock("../../middleware/requireAuth", () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: "mockUser123" };
    next();
  }
}));

// mock validators
jest.mock("../../middleware/reviewValidators.js", () => ({
  validateRestaurantId: [(req, res, next) => next()],
  validateReviewId: [(req, res, next) => next()],
  validateCreateReview: [(req, res, next) => next()],
  validateUpdateReview: [(req, res, next) => next()],
}));

// mock service layer
jest.mock("../../services/reviewService.js", () => ({
  createReview: jest.fn(),
  getReviews: jest.fn(),
  getReviewById: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
}));

const app = require("../../server.js");
const reviewService = require("../../services/reviewService.js");

describe("Review Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /restaurants/:id/reviews returns all reviews", async () => {
    reviewService.getReviews.mockResolvedValue([
      { _id: "1", rating: 5, body: "Great food" }
    ]);

    const res = await request(app).get("/restaurants/123/reviews");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { _id: "1", rating: 5, body: "Great food" }
    ]);
    expect(reviewService.getReviews).toHaveBeenCalledWith("123");
  });

  test("GET /restaurants/:id/reviews/:reviewId returns one review", async () => {
    reviewService.getReviewById.mockResolvedValue({
      _id: "1",
      rating: 4,
      body: "Nice"
    });

    const res = await request(app).get("/restaurants/123/reviews/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: "1",
      rating: 4,
      body: "Nice"
    });
    expect(reviewService.getReviewById).toHaveBeenCalledWith("123", "1");
  });

  test("POST /restaurants/:id/reviews creates a review", async () => {
    reviewService.createReview.mockResolvedValue({
      _id: "1",
      authorName: "mockUser",
      rating: 5,
      body: "Amazing"
    });

    const res = await request(app)
      .post("/restaurants/123/reviews")
      .send({
        rating: 5,
        body: "Amazing"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      _id: "1",
      authorName: "mockUser",
      rating: 5,
      body: "Amazing"
    });
    expect(reviewService.createReview).toHaveBeenCalledWith(
      "123",
      "mockUser123",
      { rating: 5, body: "Amazing" }
    );
  });

  test("PUT /restaurants/:id/reviews/:reviewId updates a review", async () => {
    reviewService.updateReview.mockResolvedValue({
      _id: "1",
      rating: 3,
      body: "Updated review"
    });

    const res = await request(app)
      .put("/restaurants/123/reviews/1")
      .send({
        rating: 3,
        body: "Updated review"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: "1",
      rating: 3,
      body: "Updated review"
    });
    expect(reviewService.updateReview).toHaveBeenCalledWith(
      "123",
      "1",
      { rating: 3, body: "Updated review" }
    );
  });

  test("DELETE /restaurants/:id/reviews/:reviewId deletes a review", async () => {
    reviewService.deleteReview.mockResolvedValue({ deleted: true });

    const res = await request(app).delete("/restaurants/123/reviews/1");

    expect(res.statusCode).toBe(204);
    expect(res.text).toBe("");
    expect(reviewService.deleteReview).toHaveBeenCalledWith(
      "123",
      "1",
      "mockUser123"
    );
  });
});