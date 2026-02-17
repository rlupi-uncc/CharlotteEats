const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in environment");

  // Prevent “hang forever”
  mongoose.set("bufferCommands", false);

  mongoose.connection.on("connected", () => console.log("db.js: MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("db.js: MongoDB error:", err));
  mongoose.connection.on("disconnected", () => console.log("db.js: MongoDB disconnected"));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  return mongoose;
}

module.exports = { connectMongo };
