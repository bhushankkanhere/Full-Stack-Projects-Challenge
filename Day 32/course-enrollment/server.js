const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3003;
const DATA_FILE = path.join(__dirname, "courses.json");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readData() {
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(fileData);

    return {
      courses: Array.isArray(parsed.courses) ? parsed.courses : [],
      enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : []
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      const fallback = { courses: [], enrollments: [] };
      await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf8");
      return fallback;
    }
    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.get("/api/courses", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to load courses." });
  }
});

app.post("/api/courses", async (req, res) => {
  const { title } = req.body;

  if (!isValidText(title)) {
    return res.status(400).json({ error: "Course title is required." });
  }

  try {
    const data = await readData();
    const normalizedTitle = normalizeText(title);

    const alreadyExists = data.courses.some(
      (course) => course.title.toLowerCase() === normalizedTitle.toLowerCase()
    );

    if (alreadyExists) {
      return res.status(409).json({ error: "Course already exists." });
    }

    const course = {
      id: Date.now().toString(),
      title: normalizedTitle,
      createdAt: new Date().toISOString()
    };

    data.courses.unshift(course);
    await writeData(data);
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add course." });
  }
});

app.post("/api/enrollments", async (req, res) => {
  const { studentName, courseId } = req.body;

  if (!isValidText(studentName) || !isValidText(courseId)) {
    return res.status(400).json({ error: "Student name and course are required." });
  }

  try {
    const data = await readData();
    const course = data.courses.find((item) => item.id === courseId.trim());

    if (!course) {
      return res.status(404).json({ error: "Selected course not found." });
    }

    const normalizedStudentName = normalizeText(studentName);
    const duplicate = data.enrollments.some(
      (item) =>
        item.courseId === course.id &&
        item.studentName.toLowerCase() === normalizedStudentName.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({ error: "Student already enrolled in this course." });
    }

    const enrollment = {
      id: Date.now().toString(),
      studentName: normalizedStudentName,
      courseId: course.id,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString()
    };

    data.enrollments.unshift(enrollment);
    await writeData(data);
    return res.status(201).json(enrollment);
  } catch (error) {
    return res.status(500).json({ error: "Failed to enroll student." });
  }
});

app.get("/api/enrollments", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to load enrollments." });
  }
});

app.listen(PORT, () => {
  console.log(`Course Enrollment server running at http://localhost:${PORT}`);
});
