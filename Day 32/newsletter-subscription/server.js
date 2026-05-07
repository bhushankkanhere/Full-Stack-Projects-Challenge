const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3002;
const DATA_FILE = path.join(__dirname, "subscribers.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const cleaned = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned);
}

async function readSubscribers() {
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

async function writeSubscribers(subscribers) {
  await fs.writeFile(DATA_FILE, JSON.stringify(subscribers, null, 2), "utf8");
}

app.get("/api/subscribers", async (req, res) => {
  try {
    const subscribers = await readSubscribers();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Failed to load subscribers." });
  }
});

app.post("/api/subscribers", async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const subscribers = await readSubscribers();
    const normalizedEmail = email.trim().toLowerCase();

    const exists = subscribers.some((subscriber) => subscriber.email === normalizedEmail);
    if (exists) {
      return res.status(409).json({ error: "This email is already subscribed." });
    }

    const newSubscriber = {
      id: Date.now().toString(),
      email: normalizedEmail,
      subscribedAt: new Date().toISOString()
    };

    subscribers.unshift(newSubscriber);
    await writeSubscribers(subscribers);

    return res.status(201).json(newSubscriber);
  } catch (error) {
    return res.status(500).json({ error: "Failed to subscribe email." });
  }
});

app.delete("/api/subscribers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const subscribers = await readSubscribers();
    const nextSubscribers = subscribers.filter((subscriber) => subscriber.id !== id);

    if (nextSubscribers.length === subscribers.length) {
      return res.status(404).json({ error: "Subscriber not found." });
    }

    await writeSubscribers(nextSubscribers);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete subscriber." });
  }
});

app.listen(PORT, () => {
  console.log(`Newsletter server running at http://localhost:${PORT}`);
});
