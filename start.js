require("dotenv").config();

const app = require("./server");

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  try {
    const { connectMongo } = require("./db");
    await connectMongo();
  } catch (e) {
    console.error("Mongo connect failed:", e);
  }
});