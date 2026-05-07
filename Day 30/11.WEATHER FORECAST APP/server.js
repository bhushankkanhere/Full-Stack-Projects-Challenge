const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your API key

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/weather/:city", async (req,res) => {
    const city = req.params.city;
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        res.json(data);
    }catch(e){
        res.json({error:"Unable to fetch weather"});
    }
});

app.listen(3000,()=>console.log("Server running at http://localhost:3000"));