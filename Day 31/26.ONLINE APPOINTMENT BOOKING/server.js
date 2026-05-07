const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let appointments = [];

app.post("/book", (req, res) => {
    appointments.push(req.body);
    res.json({ message: "Appointment booked successfully" });
});

app.get("/appointments", (req, res) => {
    res.json(appointments);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});