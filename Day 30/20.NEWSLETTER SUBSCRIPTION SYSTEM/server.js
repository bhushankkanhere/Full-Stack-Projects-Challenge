const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let subscribers = [];

app.post('/subscribe', (req, res) => {
    subscribers.push(req.body);
    res.sendStatus(200);
});

app.get('/subscribers', (req, res) => {
    res.json(subscribers);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));