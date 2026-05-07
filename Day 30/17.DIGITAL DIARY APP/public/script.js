const form = document.getElementById('diaryForm');
const entriesDiv = document.getElementById('entries');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value
    };

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadEntries();
});

async function loadEntries() {
    const res = await fetch('/entries');
    const entries = await res.json();

    entriesDiv.innerHTML = '';
    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry-card';
        div.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.content}</p>
        `;
        entriesDiv.appendChild(div);
    });
}

loadEntries();