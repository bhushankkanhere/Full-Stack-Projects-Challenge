const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let menu = [
    { name: "Paneer Butter Masala", price: 250, category: "Veg" },
    { name: "Chicken Biryani", price: 300, category: "Non-Veg" }
];

app.get('/menu', (req, res) => {
    res.json(menu);
});

app.post('/add', (req, res) => {
    menu.push(req.body);
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));