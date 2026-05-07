const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];
let contacts = {}; // user-specific contacts

// Register
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.json({ message: "User already exists" });
    }

    users.push({ username, password });
    contacts[username] = [];

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

// Get Contacts
app.get("/contacts/:username", (req, res) => {
    res.json(contacts[req.params.username] || []);
});

// Add Contact
app.post("/contacts", (req, res) => {
    const { username, name, phone } = req.body;

    contacts[username].push({ name, phone });
    res.json({ message: "Contact added" });
});

// Delete Contact
app.delete("/contacts", (req, res) => {
    const { username, index } = req.body;

    contacts[username].splice(index, 1);
    res.json({ message: "Contact deleted" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});