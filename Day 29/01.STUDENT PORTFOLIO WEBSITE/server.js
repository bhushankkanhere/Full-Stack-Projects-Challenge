const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// serve html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// serve css
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

// serve js
app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"));
});

// contact form API
app.post("/contact", (req, res) => {

    const data = req.body;

    fs.appendFile("messages.txt",
    `Name: ${data.name}
Email: ${data.email}
Message: ${data.message}
------------------------
`, err => {
        if(err){
            res.json({message:"Error saving message"});
        }else{
            res.json({message:"Message sent successfully"});
        }
    });

});

app.listen(3002, () => {
    console.log("Server running at http://localhost:3000");
});