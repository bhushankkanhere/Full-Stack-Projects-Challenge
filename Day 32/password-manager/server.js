const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "passwords.json");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

async function readPasswords() {
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

async function writePasswords(passwords) {
  await fs.writeFile(DATA_FILE, JSON.stringify(passwords, null, 2), "utf8");
}

app.get("/api/passwords", async (req, res) => {
  try {
    const passwords = await readPasswords();
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ error: "Failed to load passwords." });
  }
});

app.post("/api/passwords", async (req, res) => {
  const { site, username, password } = req.body;

  if (!isNonEmptyString(site) || !isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "Site, username, and password are required." });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password should be at least 4 characters." });
  }

  try {
    const passwords = await readPasswords();
    const newEntry = {
      id: Date.now().toString(),
      site: sanitizeText(site),
      username: sanitizeText(username),
      password: password.trim(),
      createdAt: new Date().toISOString()
    };

    passwords.unshift(newEntry);
    await writePasswords(passwords);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to save password." });
  }
});

app.delete("/api/passwords/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const passwords = await readPasswords();
    const filtered = passwords.filter((entry) => entry.id !== id);

    if (filtered.length === passwords.length) {
      return res.status(404).json({ error: "Entry not found." });
    }

    await writePasswords(filtered);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete entry." });
  }
});

app.listen(PORT, () => {
  console.log(`Password Manager server running at http://localhost:${PORT}`);
});
