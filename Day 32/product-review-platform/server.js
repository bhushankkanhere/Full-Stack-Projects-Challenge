const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3006;
const DATA_FILE = path.join(__dirname, "reviews.json");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);

    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      const fallback = { products: [], reviews: [] };
      await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf8");
      return fallback;
    }

    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.get("/api/products", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: "Failed to load products." });
  }
});

app.post("/api/products", async (req, res) => {
  const { name } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: "Product name is required." });
  }

  try {
    const data = await readData();
    const cleanedName = normalizeText(name);

    const exists = data.products.some(
      (product) => product.name.toLowerCase() === cleanedName.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({ error: "Product already exists." });
    }

    const product = {
      id: Date.now().toString(),
      name: cleanedName,
      createdAt: new Date().toISOString()
    };

    data.products.unshift(product);
    await writeData(data);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add product." });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to load reviews." });
  }
});

app.post("/api/reviews", async (req, res) => {
  const { productId, rating, comment } = req.body;
  const ratingNumber = Number(rating);

  if (!isNonEmptyString(productId) || !isNonEmptyString(comment)) {
    return res.status(400).json({ error: "Product and comment are required." });
  }

  if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  try {
    const data = await readData();
    const product = data.products.find((item) => item.id === productId.trim());

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const review = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      rating: ratingNumber,
      comment: normalizeText(comment),
      createdAt: new Date().toISOString()
    };

    data.reviews.unshift(review);
    await writeData(data);
    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add review." });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await readData();
    const nextReviews = data.reviews.filter((review) => review.id !== id);

    if (nextReviews.length === data.reviews.length) {
      return res.status(404).json({ error: "Review not found." });
    }

    data.reviews = nextReviews;
    await writeData(data);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete review." });
  }
});

app.listen(PORT, () => {
  console.log(`Product Review server running at http://localhost:${PORT}`);
});
