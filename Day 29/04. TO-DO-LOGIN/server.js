const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];
let todos = {}; // user-specific todos

// Register
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.json({ message: "User already exists" });
    }

    users.push({ username, password });
    todos[username] = [];

    res.json({ message: "Registered successfully" });
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username });
});

// Get Todos
app.get("/todos/:username", (req, res) => {
    const { username } = req.params;
    res.json(todos[username] || []);
});

// Add Todo
app.post("/todos", (req, res) => {
    const { username, task } = req.body;
    todos[username].push(task);
    res.json({ message: "Task added" });
});

// Delete Todo
app.delete("/todos", (req, res) => {
    const { username, index } = req.body;
    todos[username].splice(index, 1);
    res.json({ message: "Task deleted" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});