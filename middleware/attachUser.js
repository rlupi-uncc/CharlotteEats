const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment (.env)");

function attachUser(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.user = null;
    res.locals.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    res.locals.user = payload;
  } catch (err) {
    req.user = null;
    res.locals.user = null;
  }

  next();
}

module.exports = { attachUser };