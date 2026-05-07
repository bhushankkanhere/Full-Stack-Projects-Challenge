const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let passwords = [];

app.post('/add', (req, res) => {
    passwords.push(req.body);
    res.sendStatus(200);
});

app.get('/passwords', (req, res) => {
    res.json(passwords);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));