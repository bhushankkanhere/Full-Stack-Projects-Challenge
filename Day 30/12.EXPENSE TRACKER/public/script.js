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
            location.href="tracker.html";
        }else msg.innerText=d.message;
    });
}

function loadExpenses(){
    fetch(API+"/expenses/"+localStorage.getItem("user"))
    .then(r=>r.json()).then(data=>{
        let html="";
        let balance=0;
        data.forEach(e=>{
            balance += e.type==="Income"? +e.amount : -e.amount;
            html+=`<li>${e.date} - ${e.type} - ₹${e.amount} - ${e.note}</li>`;
        });
        list.innerHTML=html;
        bal.innerText="Balance: ₹"+balance;
    });
}

function addExpense(){
    fetch(API+"/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        username: localStorage.getItem("user"),
        type: type.value,
        amount: amount.value,
        note: note.value
    })}).then(()=>{amount.value=""; note.value=""; loadExpenses();});
}

function logout(){
    localStorage.removeItem("user");
    location.href="index.html";
}

if(location.pathname.includes("tracker.html")) loadExpenses();