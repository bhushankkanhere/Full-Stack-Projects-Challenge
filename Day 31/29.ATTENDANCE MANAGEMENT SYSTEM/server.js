const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let attendance = [];

app.post("/mark-attendance", (req, res) => {
    attendance.push(req.body);
    res.json({ message: "Attendance marked successfully" });
});

app.get("/attendance", (req, res) => {
    res.json(attendance);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});