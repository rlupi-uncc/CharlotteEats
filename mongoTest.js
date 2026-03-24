const { connectMongo } = require("./db");

(async () => {
  try {
    const db = await connectMongo();
    const res = await db.collection("test").insertOne({ working: true });
    console.log("Mongo connected:", res.insertedId);
    process.exit();
  } catch (err) {
    console.error("Mongo failed:", err);
  }
})();
