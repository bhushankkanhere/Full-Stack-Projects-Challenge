const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let posts = [];

// serve html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// serve css
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

// serve js
app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"));
});

// get posts
app.get("/posts", (req, res) => {
    res.json(posts);
});

// create post
app.post("/posts", (req, res) => {
    const post = req.body;
    post.id = Date.now();
    posts.push(post);
    res.json({ message: "Post added successfully" });
});

// delete post
app.delete("/posts/:id", (req, res) => {
    posts = posts.filter(p => p.id != req.params.id);
    res.json({ message: "Post deleted" });
});

app.listen(3001, () => {
    console.log("Server running at http://localhost:3001");
});