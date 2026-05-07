const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];
let expenses = {};

app.get("/", (req,res) => res.sendFile(path.join(__dirname,"public/index.html")));

app.post("/register",(req,res)=>{
    const {username,password} = req.body;
    if(users.find(u=>u.username===username)) return res.json({message:"User exists"});
    users.push({username,password});
    expenses[username] = [];
    res.json({message:"Registered"});
});

app.post("/login",(req,res)=>{
    const {username,password} = req.body;
    const user = users.find(u=>u.username===username && u.password===password);
    if(!user) return res.json({message:"Invalid"});
    res.json({message:"Success",username});
});

app.get("/expenses/:username",(req,res)=>{
    res.json(expenses[req.params.username] || []);
});

app.post("/add",(req,res)=>{
    const {username, type, amount, note} = req.body;
    expenses[username].push({type, amount, note, date: new Date().toLocaleString()});
    res.json({message:"Added"});
});

app.listen(3000,()=>console.log("Server running at http://localhost:3000"));