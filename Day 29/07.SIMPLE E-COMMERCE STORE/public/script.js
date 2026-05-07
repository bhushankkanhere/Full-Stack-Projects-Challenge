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
            window.location.href = "store.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }
    });
}

function loadProducts() {
    fetch(API + "/products")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("productList");
        list.innerHTML = "";

        data.forEach(p => {
            const div = document.createElement("div");
            div.className = "product";
            div.innerHTML = `${p.name} - ₹${p.price}
            <button onclick='addToCart(${JSON.stringify(p)})'>Add</button>`;
            list.appendChild(div);
        });
    });
}

function loadCart() {
    const username = localStorage.getItem("user");

    fetch(API + "/cart/" + username)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("cartList");
        list.innerHTML = "";

        let total = 0;

        data.forEach((item, index) => {
            total += item.price;

            const li = document.createElement("li");
            li.innerHTML = `${item.name} - ₹${item.price}
            <button onclick="removeFromCart(${index})">X</button>`;
            list.appendChild(li);
        });

        document.getElementById("total").innerText = "Total: ₹" + total;
    });
}

function addToCart(product) {
    const username = localStorage.getItem("user");

    fetch(API + "/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, product })
    }).then(loadCart);
}

function removeFromCart(index) {
    const username = localStorage.getItem("user");

    fetch(API + "/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, index })
    }).then(loadCart);
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

if (window.location.pathname.includes("store.html")) {
    loadProducts();
    loadCart();
}