const form = document.getElementById('complaintForm');
const complaintsDiv = document.getElementById('complaints');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value
    };

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadComplaints();
});

async function loadComplaints() {
    const res = await fetch('/complaints');
    const complaints = await res.json();

    complaintsDiv.innerHTML = '';
    complaints.forEach(c => {
        const div = document.createElement('div');
        div.className = 'complaint-card';
        div.innerHTML = `
            <h3>${c.subject}</h3>
            <p><strong>Name:</strong> ${c.name}</p>
            <p><strong>Email:</strong> ${c.email}</p>
            <p>${c.description}</p>
        `;
        complaintsDiv.appendChild(div);
    });
}

loadComplaints();