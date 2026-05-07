const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let reviews = [];

app.post("/add-review", (req, res) => {
    reviews.push(req.body);
    res.json({ message: "Review Added" });
});

app.get("/reviews", (req, res) => {
    res.json(reviews);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});