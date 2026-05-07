async function sendMessage(){

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const message = document.getElementById("message").value;

const res = await fetch("http://localhost:3000/contact",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name,
email,
message
})

});

const data = await res.json();

document.getElementById("response").innerText = data.message;

}