const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let candidates = [
    { name: "Alice", votes: 0 },
    { name: "Bob", votes: 0 },
    { name: "Charlie", votes: 0 }
];

let voters = [];

app.get('/candidates', (req, res) => {
    res.json(candidates);
});

app.post('/vote', (req, res) => {
    const { voterName, candidate } = req.body;

    if(voters.includes(voterName)) return res.sendStatus(403);

    const cand = candidates.find(c => c.name === candidate);
    if(cand) cand.votes += 1;

    voters.push(voterName);
    res.sendStatus(200);
});

app.get('/results', (req, res) => {
    res.json(candidates);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));