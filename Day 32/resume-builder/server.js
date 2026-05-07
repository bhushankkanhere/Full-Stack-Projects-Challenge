const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3005;
const DATA_FILE = path.join(__dirname, "resumes.json");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeListFromString(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

async function readResumes() {
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

async function writeResumes(resumes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(resumes, null, 2), "utf8");
}

app.get("/api/resumes", async (req, res) => {
  try {
    const resumes = await readResumes();
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: "Failed to load resumes." });
  }
});

app.post("/api/resumes", async (req, res) => {
  const { name, skills, education } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(skills) || !isNonEmptyString(education)) {
    return res.status(400).json({ error: "Name, skills, and education are required." });
  }

  const cleanedSkills = normalizeListFromString(skills);
  const cleanedEducation = normalizeListFromString(education);

  if (!cleanedSkills.length || !cleanedEducation.length) {
    return res.status(400).json({ error: "Please provide at least one skill and one education item." });
  }

  try {
    const resumes = await readResumes();

    const resume = {
      id: Date.now().toString(),
      name: normalizeText(name),
      skills: cleanedSkills,
      education: cleanedEducation,
      createdAt: new Date().toISOString()
    };

    resumes.unshift(resume);
    await writeResumes(resumes);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: "Failed to save resume." });
  }
});

app.listen(PORT, () => {
  console.log(`Resume Builder server running at http://localhost:${PORT}`);
});
