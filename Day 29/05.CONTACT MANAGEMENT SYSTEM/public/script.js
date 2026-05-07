const API = "http://localhost:3000";

// Register
function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => document.getElementById("msg").innerText = data.message);
}

// Login
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Login successful") {
            localStorage.setItem("user", data.username);
            window.location.href = "contacts.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }
    });
}

// Load Contacts
function loadContacts() {
    const username = localStorage.getItem("user");

    fetch(API + "/contacts/" + username)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach((c, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${c.name} (${c.phone}) 
            <button onclick="deleteContact(${index})">X</button>`;
            list.appendChild(li);
        });
    });
}

// Add Contact
function addContact() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const username = localStorage.getItem("user");

    fetch(API + "/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, phone })
    }).then(() => {
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        loadContacts();
    });
}

// Delete Contact
function deleteContact(index) {
    const username = localStorage.getItem("user");

    fetch(API + "/contacts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, index })
    }).then(loadContacts);
}

// Logout
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// Auto load
if (window.location.pathname.includes("contacts.html")) {
    loadContacts();
}