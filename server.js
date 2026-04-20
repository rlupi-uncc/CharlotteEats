require("dotenv").config();

const express = require("express");
const methodOverride = require('method-override');
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const reviewRoutes = require("./routes/reviewRoutes");
const restaurantRoutes = require("./routes/restaurant");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { requireAuth } = require("./middleware/requireAuth");
const { attachUser } = require("./middleware/attachUser");
const userRepo = require("./repositories/userRepo");
const reservationRoutes = require("./routes/reservations");
const reservationService = require("./services/reservationService");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

//Added Code to Access Images in Folder Img
app.use("/img", express.static(path.join(__dirname, "img")));

// Serve static assets: prefer files in `public/`, then fall back to project root
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname)));
app.use(express.static("public/css"));

app.use(cookieParser());
app.use(attachUser);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/restaurants", restaurantRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
// app.use("/restaurants/:id/reviews", reviewRoutes);
app.use("/restaurants/:id/reservations", reservationRoutes);

app.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await userRepo.findUserById(req.user.id);
    if (!user) return res.status(401).redirect("/");

    const reservations = await reservationService.getReservationsForUser(req.user.id);

    return res.render("userProfile", { user, reservations });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }

  res.render("login");
});

app.get("/edit_profile", requireAuth, async (req, res) => {
  try {
    const user = await userRepo.findUserById(req.user.id);
    if (!user) return res.status(401).redirect("/");

    return res.render("userProfileEdit", { user });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/reviews", requireAuth, async (req, res) => {
  const restaurantId = req.query.id;
  if (!restaurantId) return res.status(400).send("Missing restaurant id");
  // res.render("reviews", { restaurantId, user: { id: req.user.id } });
  res.render("reviews", { 
    reviews: [], 
    filters: { sort: ""},
    restaurantId, 
    user: { id: req.user.id} 
  });
});

module.exports = app;