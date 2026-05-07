const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let feedbacks = [];

function analyzeSentiment(text){
    const positive = ["good", "great", "excellent", "awesome", "love"];
    const negative = ["bad", "poor", "terrible", "hate", "worst"];
    const txt = text.toLowerCase();
    let score = 0;
    positive.forEach(word => { if(txt.includes(word)) score++; });
    negative.forEach(word => { if(txt.includes(word)) score--; });
    if(score > 0) return "Positive";
    if(score < 0) return "Negative";
    return "Neutral";
}

app.post("/submit-feedback", (req, res) => {
    const sentiment = analyzeSentiment(req.body.feedback);
    const data = { text: req.body.feedback, sentiment };
    feedbacks.push(data);
    res.json(data);
});

app.get("/feedbacks", (req, res) => {
    res.json(feedbacks);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});