const API = "http://localhost:3000";

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
            window.location.href = "events.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }
    });
}

function loadEvents() {
    const username = localStorage.getItem("user");

    fetch(API + "/events/" + username)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach((e, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${e.title} (${e.date}) 
            <button onclick="deleteEvent(${index})">X</button>`;
            list.appendChild(li);
        });
    });
}

function addEvent() {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const username = localStorage.getItem("user");

    fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, title, date })
    }).then(() => {
        document.getElementById("title").value = "";
        document.getElementById("date").value = "";
        loadEvents();
    });
}

function deleteEvent(index) {
    const username = localStorage.getItem("user");

    fetch(API + "/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, index })
    }).then(loadEvents);
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

if (window.location.pathname.includes("events.html")) {
    loadEvents();
}