const API = "http://localhost:3000";

function register() {
    fetch(API + "/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    }).then(r=>r.json()).then(d=>msg.innerText=d.message);
}

function login() {
    fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    }).then(r=>r.json()).then(d=>{
        if(d.message==="Login successful"){
            localStorage.setItem("user", d.username);
            location.href="feedback.html";
        } else msg.innerText=d.message;
    });
}

function add() {
    fetch(API + "/feedback", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: localStorage.getItem("user"),
            text: text.value,
            rating: rating.value
        })
    }).then(()=>{text.value=""; load();});
}

function load() {
    fetch(API + "/feedback/" + localStorage.getItem("user"))
    .then(r=>r.json()).then(data=>{
        list.innerHTML="";
        data.forEach(f=>{
            let li=document.createElement("li");
            li.innerHTML = f.text + "<br>" + "⭐".repeat(f.rating) + "<br><small>"+f.date+"</small>";
            list.appendChild(li);
        });
    });
}

function logout() {
    localStorage.removeItem("user");
    location.href="index.html";
}

if(location.pathname.includes("feedback.html")) load();