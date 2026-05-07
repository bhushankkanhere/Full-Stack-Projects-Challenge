const API="http://localhost:3000";

function register(){
    fetch(API+"/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:username.value,password:password.value})})
    .then(r=>r.json()).then(d=>msg.innerText=d.message);
}

function login(){
    fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:username.value,password:password.value})})
    .then(r=>r.json()).then(d=>{
        if(d.message==="Success"){
            localStorage.setItem("user",d.username);
            location.href="library.html";
        }else msg.innerText=d.message;
    });
}

function loadBooks(){
    fetch(API+"/books/"+localStorage.getItem("user"))
    .then(r=>r.json()).then(data=>{
        let html="";
        data.forEach(b=>{
            html+=`<li>${b.title} by ${b.author} (${b.year})</li>`;
        });
        list.innerHTML=html;
    });
}

function addBook(){
    fetch(API+"/addbook",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        username: localStorage.getItem("user"),
        title: title.value,
        author: author.value,
        year: year.value
    })}).then(()=>{title.value="";author.value="";year.value="";loadBooks();});
}

function logout(){
    localStorage.removeItem("user");
    location.href="index.html";
}

if(location.pathname.includes("library.html")) loadBooks();