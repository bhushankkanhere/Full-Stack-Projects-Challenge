const API_URL = "http://localhost:3002/notes";

async function fetchNotes() {
    const res = await fetch(API_URL);
    const notes = await res.json();

    const container = document.getElementById("notes-container");
    container.innerHTML = "";

    notes.forEach(note => {
        const div = document.createElement("div");
        div.className = "note";

        div.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
        `;

        container.appendChild(div);
    });
}

async function addNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (!title || !content) {
        alert("Please fill all fields!");
        return;
    }

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    fetchNotes();
}

async function deleteNote(id) {
    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    fetchNotes();
}

// Load notes on start
fetchNotes();