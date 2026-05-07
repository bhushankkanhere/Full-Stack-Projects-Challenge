const form = document.getElementById('jobForm');
const applicationsDiv = document.getElementById('applications');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        resume: document.getElementById('resume').value
    };

    await fetch('/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadApplications();
});

async function loadApplications() {
    const res = await fetch('/applications');
    const apps = await res.json();

    applicationsDiv.innerHTML = '';
    apps.forEach(app => {
        const div = document.createElement('div');
        div.className = 'application-card';
        div.innerHTML = `
            <h3>${app.name}</h3>
            <p><strong>Email:</strong> ${app.email}</p>
            <p><strong>Position:</strong> ${app.position}</p>
            <p>${app.resume}</p>
        `;
        applicationsDiv.appendChild(div);
    });
}

loadApplications();