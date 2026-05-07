const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

let users = [];

let questions = [
    { q: "Capital of India?", options: ["Delhi","Mumbai","Pune","Chennai"], answer: "Delhi" },
    { q: "2 + 2 = ?", options: ["3","4","5","6"], answer: "4" },
    { q: "HTML stands for?", options: ["Hyper Text Markup Language","High Text Machine Language","Hyper Tool Multi Language","None"], answer: "Hyper Text Markup Language" }
];

app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"public/index.html")));

app.post("/register",(req,res)=>{
    const {username,password}=req.body;
    if(users.find(u=>u.username===username)) return res.json({message:"User exists"});
    users.push({username,password});
    res.json({message:"Registered"});
});

app.post("/login",(req,res)=>{
    const {username,password}=req.body;
    const user=users.find(u=>u.username===username && u.password===password);
    if(!user) return res.json({message:"Invalid"});
    res.json({message:"Success",username});
});

app.get("/questions",(req,res)=>{
    res.json(questions);
});

app.listen(3000,()=>console.log("http://localhost:3000"));