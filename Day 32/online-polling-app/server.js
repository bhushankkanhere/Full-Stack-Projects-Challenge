const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3004;
const DATA_FILE = path.join(__dirname, "polls.json");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);

    return {
      polls: Array.isArray(parsed.polls) ? parsed.polls : []
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      const fallback = { polls: [] };
      await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf8");
      return fallback;
    }

    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.get("/api/polls", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.polls);
  } catch (error) {
    res.status(500).json({ error: "Failed to load polls." });
  }
});

app.post("/api/polls", async (req, res) => {
  const { question, options } = req.body;

  if (!isNonEmptyString(question)) {
    return res.status(400).json({ error: "Poll question is required." });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "At least 2 options are required." });
  }

  const cleanedOptions = options
    .filter((option) => isNonEmptyString(option))
    .map((option) => normalizeText(option));

  if (cleanedOptions.length < 2) {
    return res.status(400).json({ error: "At least 2 valid options are required." });
  }

  try {
    const data = await readData();

    const poll = {
      id: Date.now().toString(),
      question: normalizeText(question),
      options: cleanedOptions.map((text, index) => ({
        id: `${Date.now()}-${index}`,
        text,
        votes: 0
      })),
      votedBy: [],
      createdAt: new Date().toISOString()
    };

    data.polls.unshift(poll);
    await writeData(data);

    return res.status(201).json(poll);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create poll." });
  }
});

app.post("/api/polls/:pollId/vote", async (req, res) => {
  const { pollId } = req.params;
  const { optionId, voterId } = req.body;

  if (!isNonEmptyString(optionId) || !isNonEmptyString(voterId)) {
    return res.status(400).json({ error: "Option and voter are required." });
  }

  try {
    const data = await readData();
    const poll = data.polls.find((item) => item.id === pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }

    if (!Array.isArray(poll.votedBy)) {
      poll.votedBy = [];
    }

    if (poll.votedBy.includes(voterId)) {
      return res.status(409).json({ error: "You have already voted on this poll." });
    }

    const selectedOption = poll.options.find((option) => option.id === optionId);
    if (!selectedOption) {
      return res.status(404).json({ error: "Selected option not found." });
    }

    selectedOption.votes += 1;
    poll.votedBy.push(voterId);

    await writeData(data);
    return res.json(poll);
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit vote." });
  }
});

app.listen(PORT, () => {
  console.log(`Online Polling server running at http://localhost:${PORT}`);
});
