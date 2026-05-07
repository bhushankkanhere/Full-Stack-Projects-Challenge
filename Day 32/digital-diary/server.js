const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "diary.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function readEntries() {
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

async function writeEntries(entries) {
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
}

app.get("/api/entries", async (req, res) => {
  try {
    const entries = await readEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to load entries." });
  }
});

app.post("/api/entries", async (req, res) => {
  const { date, text } = req.body;

  if (!date || !text || !text.trim()) {
    return res.status(400).json({ error: "Date and text are required." });
  }

  try {
    const entries = await readEntries();
    const newEntry = {
      id: Date.now().toString(),
      date,
      text: text.trim()
    };

    entries.unshift(newEntry);
    await writeEntries(entries);
    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({ error: "Failed to save entry." });
  }
});

app.delete("/api/entries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const entries = await readEntries();
    const nextEntries = entries.filter((entry) => entry.id !== id);

    if (nextEntries.length === entries.length) {
      return res.status(404).json({ error: "Entry not found." });
    }

    await writeEntries(nextEntries);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete entry." });
  }
});

app.listen(PORT, () => {
  console.log(`Digital Diary server running at http://localhost:${PORT}`);
});
