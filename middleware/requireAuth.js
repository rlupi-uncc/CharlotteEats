const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment (.env)");

function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).redirect("/");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload should have { id, role } from your authService
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).redirect("/");
  }
}

module.exports = { requireAuth };