const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let diaryEntries = [];

app.post('/add', (req, res) => {
    diaryEntries.push(req.body);
    res.sendStatus(200);
});

app.get('/entries', (req, res) => {
    res.json(diaryEntries);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));