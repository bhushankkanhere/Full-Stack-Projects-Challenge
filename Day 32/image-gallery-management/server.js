const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3007;
const DATA_FILE = path.join(__dirname, "images.json");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isValidImageUrl(urlText) {
  try {
    const parsedUrl = new URL(urlText);
    const hasHttpProtocol = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    const looksLikeImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(parsedUrl.pathname + parsedUrl.search);
    return hasHttpProtocol && looksLikeImage;
  } catch (error) {
    return false;
  }
}

async function readImages() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }

    throw error;
  }
}

async function writeImages(images) {
  await fs.writeFile(DATA_FILE, JSON.stringify(images, null, 2), "utf8");
}

app.get("/api/images", async (req, res) => {
  try {
    const images = await readImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to load images." });
  }
});

app.post("/api/images", async (req, res) => {
  const { title, url } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Image title is required." });
  }

  if (typeof url !== "string" || !isValidImageUrl(url.trim())) {
    return res.status(400).json({ error: "Valid image URL is required (http/https with image extension)." });
  }

  try {
    const images = await readImages();
    const image = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date().toISOString()
    };

    images.unshift(image);
    await writeImages(images);
    return res.status(201).json(image);
  } catch (error) {
    return res.status(500).json({ error: "Failed to save image." });
  }
});

app.delete("/api/images/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const images = await readImages();
    const nextImages = images.filter((image) => image.id !== id);

    if (nextImages.length === images.length) {
      return res.status(404).json({ error: "Image not found." });
    }

    await writeImages(nextImages);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete image." });
  }
});

app.listen(PORT, () => {
  console.log(`Image Gallery server running at http://localhost:${PORT}`);
});
