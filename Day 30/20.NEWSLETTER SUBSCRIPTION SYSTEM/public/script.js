const form = document.getElementById('subscribeForm');
const subscribersDiv = document.getElementById('subscribers');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };

    await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadSubscribers();
});

async function loadSubscribers() {
    const res = await fetch('/subscribers');
    const subscribers = await res.json();

    subscribersDiv.innerHTML = '';
    subscribers.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'subscriber-card';
        div.innerHTML = `<strong>${sub.name}</strong> - ${sub.email}`;
        subscribersDiv.appendChild(div);
    });
}

loadSubscribers();