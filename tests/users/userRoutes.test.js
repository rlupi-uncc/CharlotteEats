const request = require("supertest");
const app = require("../../server.js");
const userService = require("../../services/userService.js");

// mock auth
jest.mock("../../middleware/requireAuth", () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: "mockUser123" };
    next();
  }
}));

// mock validators
jest.mock("../../middleware/userValidators.js", () => ({
  validateUpdateUser: [(req, res, next) => next()],
  validateLogin: [(req, res, next) => next()],
  validateUser: [(req, res, next) => next()],
}));

// mock service layer
jest.mock("../../services/userService.js", () => ({
  updateUser: jest.fn(),
  getUser: jest.fn(),
  getAllUsers: jest.fn(),
  deleteUser: jest.fn(),
}));

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  

  test("GET user/me returns 200 and the current user", async () => {
    userService.getUser.mockResolvedValue({username: "testuser", email: "testuser@example.com"});
    const res = await request(app).get("/user/me").send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({username: "testuser", email: "testuser@example.com"});
  });

  test("PUT user/me returns 302", async () => {
    userService.updateUser.mockResolvedValue({username: "testuser", email: "testuser1@example.com"});
    const res = await request(app).put("/user/me").send({email:"testuser1@example.com"});
    expect(res.statusCode).toBe(302);
  });

  test("DELETE user/me returns 204", async () => {
    const res = await request(app).delete("/user/me").send();
    expect(res.statusCode).toBe(204);
  });
});