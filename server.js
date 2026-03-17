require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Serve static assets: prefer files in `public/`, then fall back to project root
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname)));
app.use(express.static("public/css"));

app.use(cookieParser());


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const reviewRoutes = require("./routes/reviewRoutes");
const restaurantRoutes = require("./routes/restaurant");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { requireAuth } = require("./middleware/requireAuth");
const userRepo = require("./repositories/userRepo");

app.use("/restaurants", restaurantRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/restaurants/:id/reviews", reviewRoutes);

app.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await userRepo.findUserById(req.user.id); // safe (no password)
    if (!user) return res.status(401).redirect("/");

    return res.render("userProfile", { user });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/edit_profile", (req, res) => {
  res.render("userProfileEdit");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/reviews", requireAuth, async (req, res) => {
  const restaurantId = req.query.id;
  if (!restaurantId) return res.status(400).send("Missing restaurant id");
  res.render("reviews", { restaurantId, user: { id: req.user.id } });
});

const PORT = 8000;
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Connect to Mongo after server is listening
  try {
    const { connectMongo } = require("./db");
    await connectMongo();
  } catch (e) {
    console.error("Mongo connect failed:", e);
  }
});
