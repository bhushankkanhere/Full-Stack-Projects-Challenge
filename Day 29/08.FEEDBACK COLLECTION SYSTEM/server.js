const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];
let feedbacks = {};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) return res.json({ message: "User already exists" });
    users.push({ username, password });
    feedbacks[username] = [];
    res.json({ message: "Registered successfully" });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.json({ message: "Invalid credentials" });
    res.json({ message: "Login successful", username });
});

app.get("/feedback/:username", (req, res) => {
    res.json(feedbacks[req.params.username] || []);
});

app.post("/feedback", (req, res) => {
    const { username, text, rating } = req.body;
    feedbacks[username].push({ text, rating, date: new Date().toLocaleString() });
    res.json({ message: "Submitted" });
});

app.listen(3000, () => console.log("http://localhost:3000"));