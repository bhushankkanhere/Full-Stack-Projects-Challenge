const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let notes = [];
let idCounter = 1;

// Get all notes
app.get("/notes", (req, res) => {
    res.json(notes);
});

// Add note
app.post("/notes", (req, res) => {
    const { title, content } = req.body;

    const newNote = {
        id: idCounter++,
        title,
        content
    };

    notes.push(newNote);
    res.json(newNote);
});

// Delete note
app.delete("/notes/:id", (req, res) => {
    const id = parseInt(req.params.id);
    notes = notes.filter(note => note.id !== id);
    res.json({ message: "Deleted" });
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3002");
});