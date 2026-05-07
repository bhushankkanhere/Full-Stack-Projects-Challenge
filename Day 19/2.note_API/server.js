import express from 'express';

const app = express();

app.use(express.json());

let notes = [];

app.get('/notes',(req,res)=>{
    res.json(notes);
});

app.get('/notes/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    const note = notes.find(n => n.id === id);

    if(!note){
        return res.status(404).json({message: "notes not founds"});
    }
    res.json(note);
});


app.post('/notes',(req,res)=>{
    const {title,content} = req.body;

     if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    const newNote = {
        id: Date.now(),
        title,
        content,
        createdAt : new Date()
    };

    notes.push(newNote);

    res.status(201).json(newNote);
});

app.put('/notes/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    const {title,content } = req.body;

    const note = notes.find(n => n.id === id);

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    res.json(note);
});

app.delete('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const exists = notes.some(n => n.id === id);
    if (!exists) {
        return res.status(404).json({ message: "Note not found" });
    }

    notes = notes.filter(n => n.id !== id);

    res.json({ message: "Note deleted successfully" });
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});