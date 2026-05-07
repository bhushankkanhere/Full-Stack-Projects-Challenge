const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let resumes = [];

app.post("/save", (req, res) => {
    resumes.push(req.body);
    res.json({ message: "Saved Successfully" });
});

app.get("/resumes", (req, res) => {
    res.json(resumes);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});