require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function connect() {
  await client.connect();
  return client.db("sprint0_demo");
}

module.exports = { connect };
