require("dotenv").config();

const { connectMongo } = require("../db");
const User = require("../models/User");

async function run() {
  console.log("CreateUser.js: starting");

  await connectMongo();
  console.log("CreateUser.js: connected to Mongo");

  // delete old test user if present
  await User.deleteMany({ username: "testuser" });

  const user = await User.create({
    username: "testuser3",
    email: "test3@example.com",
    password: "password123",
    role: "user",
    profilePicture: "",
    balance: 0
  });

  console.log("CreateUser.js: created user:");
  console.log({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    balance: user.balance,
    passwordStoredAs: user.password // should be hashed
  });

  process.exit(0);
}

run().catch((err) => {
  console.error("CreateUser.js: ERROR:", err);
  process.exit(1);
});
