const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads");
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

let images = [];

app.post("/upload", upload.single("image"), (req, res) => {
    images.push(`/uploads/${req.file.filename}`);
    res.json({ message: "Image Uploaded", image: `/uploads/${req.file.filename}` });
});

app.get("/images", (req, res) => {
    res.json(images);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});