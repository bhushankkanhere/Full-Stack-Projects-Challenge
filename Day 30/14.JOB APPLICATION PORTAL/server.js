const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let applications = [];

app.post('/apply', (req, res) => {
    applications.push(req.body);
    res.sendStatus(200);
});

app.get('/applications', (req, res) => {
    res.json(applications);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));