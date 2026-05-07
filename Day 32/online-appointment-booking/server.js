const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3008;
const DATA_FILE = path.join(__dirname, "appointments.json");

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

async function readAppointments() {
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

async function writeAppointments(appointments) {
  await fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), "utf8");
}

app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await readAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to load appointments." });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { name, date, time } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: "Name is required." });
  }

  if (!isNonEmptyString(date) || !isValidDate(date.trim())) {
    return res.status(400).json({ error: "Valid date is required (YYYY-MM-DD)." });
  }

  if (!isNonEmptyString(time) || !isValidTime(time.trim())) {
    return res.status(400).json({ error: "Valid time is required (HH:MM)." });
  }

  try {
    const appointments = await readAppointments();
    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanDate = date.trim();
    const cleanTime = time.trim();

    const conflict = appointments.some(
      (item) => item.date === cleanDate && item.time === cleanTime
    );

    if (conflict) {
      return res.status(409).json({ error: "This time slot is already booked." });
    }

    const appointment = {
      id: Date.now().toString(),
      name: cleanName,
      date: cleanDate,
      time: cleanTime,
      createdAt: new Date().toISOString()
    };

    appointments.push(appointment);
    appointments.sort((a, b) => {
      const left = `${a.date}T${a.time}`;
      const right = `${b.date}T${b.time}`;
      return left.localeCompare(right);
    });

    await writeAppointments(appointments);
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: "Failed to book appointment." });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const appointments = await readAppointments();
    const nextAppointments = appointments.filter((item) => item.id !== id);

    if (nextAppointments.length === appointments.length) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    await writeAppointments(nextAppointments);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel appointment." });
  }
});

app.listen(PORT, () => {
  console.log(`Appointment Booking server running at http://localhost:${PORT}`);
});
