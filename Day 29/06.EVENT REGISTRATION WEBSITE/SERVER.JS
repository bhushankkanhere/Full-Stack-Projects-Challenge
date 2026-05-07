const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];
let events = {};

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.json({ message: "User already exists" });
    }

    users.push({ username, password });
    events[username] = [];

    res.json({ message: "Registered successfully" });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username });
});

app.get("/events/:username", (req, res) => {
    res.json(events[req.params.username] || []);
});

app.post("/events", (req, res) => {
    const { username, title, date } = req.body;

    events[username].push({ title, date });
    res.json({ message: "Event added" });
});

app.delete("/events", (req, res) => {
    const { username, index } = req.body;

    events[username].splice(index, 1);
    res.json({ message: "Event deleted" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});