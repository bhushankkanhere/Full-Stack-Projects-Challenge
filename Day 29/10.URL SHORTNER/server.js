const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const shortid = require("shortid");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let urls = {};

app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"public/index.html")));

app.post("/shorten",(req,res)=>{
    const { longUrl } = req.body;
    const id = shortid.generate();
    urls[id] = longUrl;
    res.json({ shortUrl: `http://localhost:3000/${id}` });
});

app.get("/:id",(req,res)=>{
    const longUrl = urls[req.params.id];
    if(longUrl) res.redirect(longUrl);
    else res.send("URL not found");
});

app.listen(3000,()=>console.log("Server running on http://localhost:3000"));