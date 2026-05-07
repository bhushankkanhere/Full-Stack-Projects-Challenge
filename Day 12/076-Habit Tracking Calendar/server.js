const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 4004;
const DATA_FILE = path.join(__dirname, "data.json");

const initialData = { habits: [], logs: [] };

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading data.json:", e.message);
  }
  writeData(initialData);
  return { ...initialData };
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function serveHTML(res, filePath) {
  fs.readFile(filePath, "utf-8", (err, content) => {
    if (err) {
      sendJSON(res, 500, { error: "Failed to serve file" });
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(content);
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // GET / - serve index.html
  if (pathname === "/" && method === "GET") {
    return serveHTML(res, path.join(__dirname, "index.html"));
  }

  // GET /api/habits
  if (pathname === "/api/habits" && method === "GET") {
    const data = readData();
    return sendJSON(res, 200, { habits: data.habits, logs: data.logs });
  }

  // POST /api/habits
  if (pathname === "/api/habits" && method === "POST") {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.name.trim()) {
        return sendJSON(res, 400, { error: "Habit name is required" });
      }
      const data = readData();
      const habit = {
        id: generateId(),
        name: body.name.trim(),
        color: body.color || "#6366f1",
        createdAt: new Date().toISOString(),
      };
      data.habits.push(habit);
      writeData(data);
      return sendJSON(res, 201, habit);
    } catch (e) {
      return sendJSON(res, 400, { error: "Invalid request body" });
    }
  }

  // DELETE /api/habits/:id
  const deleteMatch = pathname.match(/^\/api\/habits\/([^/]+)$/);
  if (deleteMatch && method === "DELETE") {
    const id = deleteMatch[1];
    const data = readData();
    const habitIndex = data.habits.findIndex((h) => h.id === id);
    if (habitIndex === -1) {
      return sendJSON(res, 404, { error: "Habit not found" });
    }
    data.habits.splice(habitIndex, 1);
    data.logs = data.logs.filter((l) => l.habitId !== id);
    writeData(data);
    return sendJSON(res, 200, { message: "Habit deleted" });
  }

  // POST /api/habits/:id/log
  const logMatch = pathname.match(/^\/api\/habits\/([^/]+)\/log$/);
  if (logMatch && method === "POST") {
    try {
      const habitId = logMatch[1];
      const body = await parseBody(req);
      if (!body.date) {
        return sendJSON(res, 400, { error: "Date is required" });
      }
      const data = readData();
      const habit = data.habits.find((h) => h.id === habitId);
      if (!habit) {
        return sendJSON(res, 404, { error: "Habit not found" });
      }
      const existingLogIndex = data.logs.findIndex(
        (l) => l.habitId === habitId && l.date === body.date
      );
      if (existingLogIndex !== -1) {
        data.logs.splice(existingLogIndex, 1);
        writeData(data);
        return sendJSON(res, 200, { logged: false, date: body.date });
      } else {
        const log = {
          id: generateId(),
          habitId,
          date: body.date,
          completedAt: new Date().toISOString(),
        };
        data.logs.push(log);
        writeData(data);
        return sendJSON(res, 200, { logged: true, date: body.date });
      }
    } catch (e) {
      return sendJSON(res, 400, { error: "Invalid request body" });
    }
  }

  // 404 for everything else
  sendJSON(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Habit Tracker server running on http://localhost:${PORT}`);
  if (!fs.existsSync(DATA_FILE)) {
    writeData(initialData);
    console.log("Created data.json");
  }
});
