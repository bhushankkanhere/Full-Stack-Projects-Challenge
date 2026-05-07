const menuDiv = document.getElementById('menu');
const form = document.getElementById('menuForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const item = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value
    };

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });

    form.reset();
    loadMenu();
});

async function loadMenu() {
    const res = await fetch('/menu');
    const items = await res.json();

    menuDiv.innerHTML = '';

    items.forEach(i => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <span>${i.name} (${i.category})</span>
            <strong>₹${i.price}</strong>
        `;
        menuDiv.appendChild(div);
    });
}

loadMenu();