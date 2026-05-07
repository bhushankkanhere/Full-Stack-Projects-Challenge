const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "complaints.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function readComplaints() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }
    throw error;
  }
}

async function writeComplaints(complaints) {
  await fs.writeFile(DATA_FILE, JSON.stringify(complaints, null, 2), "utf8");
}

app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await readComplaints();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to load complaints." });
  }
});

app.post("/api/complaints", async (req, res) => {
  const { name, issue } = req.body;

  if (!name || !name.trim() || !issue || !issue.trim()) {
    return res.status(400).json({ error: "Name and issue are required." });
  }

  try {
    const complaints = await readComplaints();
    const newComplaint = {
      id: Date.now().toString(),
      name: name.trim(),
      issue: issue.trim(),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    complaints.unshift(newComplaint);
    await writeComplaints(complaints);

    return res.status(201).json(newComplaint);
  } catch (error) {
    return res.status(500).json({ error: "Failed to register complaint." });
  }
});

app.patch("/api/complaints/:id/resolve", async (req, res) => {
  const { id } = req.params;

  try {
    const complaints = await readComplaints();
    const index = complaints.findIndex((complaint) => complaint.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    complaints[index].status = "resolved";
    complaints[index].resolvedAt = new Date().toISOString();

    await writeComplaints(complaints);
    return res.json(complaints[index]);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update complaint status." });
  }
});

app.listen(PORT, () => {
  console.log(`Complaint Registration server running at http://localhost:${PORT}`);
});
