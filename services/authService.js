const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/userRepo.js");
const mongodb = require("mongodb");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment (.env)");
}

function normalizeExpiresIn(v) {
  if (!v) return "1h";
  if (/^\d+$/.test(v)) return Number(v); // seconds
  return v; // e.g. "1h", "7d", "15m"
}

async function signUp(username, email, password) {
  try {
    // IMPORTANT: Do NOT hash here — your User model pre("save") hashes password.
    const newUser = await userRepo.createUser({ username, email, password });
    return newUser; // safe user (no password) if your repo returns toJSON/lean-safe
  } catch (err) {
    // Handle duplicate key errors (email or username)
    if (err instanceof mongodb.MongoServerError && err.code === 11000) {
      const dupFields = Object.keys(err.keyPattern || err.keyValue || {});
      const field = dupFields[0] || "field";

      const e = new Error(
        field === "email"
          ? "Email has already been used"
          : field === "username"
          ? "Username has already been used"
          : "Account already exists"
      );
      e.status = 409;
      throw e;
    }

    throw err;
  }
}

async function logIn(email, password) {
  const user = await userRepo.findUserByEmail(email); // must return doc with password hash
  if (!user) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }

  const isMatch = await user.comparePassword(password); // uses your schema method
  if (!isMatch) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }

  const accessToken = jwt.sign(
    { id: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: normalizeExpiresIn(JWT_EXPIRES_IN) }
  );

  return { accessToken };
}

module.exports = { signUp, logIn };