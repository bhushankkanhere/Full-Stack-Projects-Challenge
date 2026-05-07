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
            window.location.href = "todo.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }
    });
}

// Load Todos
function loadTodos() {
    const username = localStorage.getItem("user");

    fetch(API + "/todos/" + username)
    .then(res => res.json())
    .then(tasks => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${task} <button onclick="deleteTask(${index})">X</button>`;
            list.appendChild(li);
        });
    });
}

// Add Task
function addTask() {
    const task = document.getElementById("task").value;
    const username = localStorage.getItem("user");

    fetch(API + "/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, task })
    }).then(() => {
        document.getElementById("task").value = "";
        loadTodos();
    });
}

// Delete Task
function deleteTask(index) {
    const username = localStorage.getItem("user");

    fetch(API + "/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, index })
    }).then(loadTodos);
}

// Logout
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// Auto load
if (window.location.pathname.includes("todo.html")) {
    loadTodos();
}