const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];

let products = [
    { name: "Shoes", price: 1200 },
    { name: "Watch", price: 2500 },
    { name: "Bag", price: 900 },
    { name: "Headphones", price: 1500 }
];

let carts = {};

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.json({ message: "User already exists" });
    }

    users.push({ username, password });
    carts[username] = [];

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

app.get("/products", (req, res) => {
    res.json(products);
});

app.get("/cart/:username", (req, res) => {
    res.json(carts[req.params.username] || []);
});

app.post("/cart", (req, res) => {
    const { username, product } = req.body;

    carts[username].push(product);
    res.json({ message: "Added to cart" });
});

app.delete("/cart", (req, res) => {
    const { username, index } = req.body;

    carts[username].splice(index, 1);
    res.json({ message: "Removed from cart" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});