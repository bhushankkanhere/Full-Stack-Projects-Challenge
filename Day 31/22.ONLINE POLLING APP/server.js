const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let poll = {
    question: "Which programming language do you prefer?",
    options: ["Python", "JavaScript", "Java", "C++"]
};

let results = {
    "Python": 0,
    "JavaScript": 0,
    "Java": 0,
    "C++": 0
};

app.get('/poll', (req, res) => {
    res.json(poll);
});

app.post('/vote', (req, res) => {
    const { option } = req.body;
    if (results.hasOwnProperty(option)) {
        results[option]++;
    }
    res.sendStatus(200);
});

app.get('/results', (req, res) => {
    res.json(results);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));