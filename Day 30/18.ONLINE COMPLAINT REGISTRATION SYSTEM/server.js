const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let complaints = [];

app.post('/add', (req, res) => {
    complaints.push(req.body);
    res.sendStatus(200);
});

app.get('/complaints', (req, res) => {
    res.json(complaints);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));