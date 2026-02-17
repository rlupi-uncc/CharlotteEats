require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const restaurantRoutes = require("./routes/restaurant");
app.use("/restaurants", restaurantRoutes);

app.get("/", (req, res) => {
  res.send("CharlotteEats server is running!");
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
