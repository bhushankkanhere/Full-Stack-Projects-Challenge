const form = document.getElementById('passwordForm');
const passwordsDiv = document.getElementById('passwords');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        account: document.getElementById('account').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadPasswords();
});

async function loadPasswords() {
    const res = await fetch('/passwords');
    const passwords = await res.json();

    passwordsDiv.innerHTML = '';
    passwords.forEach(p => {
        const div = document.createElement('div');
        div.className = 'password-card';
        div.innerHTML = `
            <div>
                <strong>${p.account}</strong> <br>
                <span>${p.username}</span> <br>
                <span>${p.password}</span>
            </div>
            <button class="copy-btn" onclick="copyPassword('${p.password}')">Copy</button>
        `;
        passwordsDiv.appendChild(div);
    });
}

function copyPassword(pass) {
    navigator.clipboard.writeText(pass);
    alert('Password copied!');
}

loadPasswords();