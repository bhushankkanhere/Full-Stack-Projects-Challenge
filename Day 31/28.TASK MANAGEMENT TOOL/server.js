const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let tasks = [];

app.post("/add-task", (req, res) => {
    tasks.push(req.body);
    res.json({ message: "Task added successfully" });
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});