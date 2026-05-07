const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let courses = [
    { name: "Web Development" },
    { name: "Data Science" },
    { name: "Machine Learning" },
    { name: "Cybersecurity" }
];

let enrollments = [];

app.get('/courses', (req, res) => {
    res.json(courses);
});

app.post('/enroll', (req, res) => {
    enrollments.push(req.body);
    res.sendStatus(200);
});

app.get('/enrollments', (req, res) => {
    res.json(enrollments);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));