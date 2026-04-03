const request = require("supertest");
const app = require("../../server.js");
const authService = require("../../services/authService.js");
const { validateUpdateUser } = require("../../middleware/userValidators.js");

// mock validators
jest.mock("../../middleware/userValidators.js", () => ({
  validateUpdateUser: [(req, res, next) => next()],
  validateUser: [(req, res, next) => next()],
  validateLogin: [(req, res, next) => next()]
}));

// mock service layer
jest.mock("../../services/authService.js", () => ({
  logIn: jest.fn(),
  signUp: jest.fn(),
}));

describe("Auth Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /auth/login returns 302 and redirects to profile when valid credentials are provided", async () => {
    
    authService.logIn.mockResolvedValue({email: "testuser@example.com", password: 123});

    const res = await request(app).post("/auth/login").send({email:"testuser@example.com", password: 123});
    expect(res.statusCode).toBe(302);

  });

  test("POST /auth/register returns 302 when a user is created", async () => {

    const res = await request(app).post("/auth/register").send(username="testuser", email="testuser@example.com", password=123, confirm_password=123);
    expect(res.statusCode).toBe(302);

  });

  test("POST /auth/logout returns 302 and redirects the user to the landing page", async () => {
    
    const res = await request(app).post("/auth/logout").send();
    expect(res.statusCode).toBe(302);

  });
});