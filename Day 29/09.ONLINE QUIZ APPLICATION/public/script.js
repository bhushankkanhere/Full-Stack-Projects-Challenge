const API="http://localhost:3000";

function register(){
fetch(API+"/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:username.value,password:password.value})})
.then(r=>r.json()).then(d=>msg.innerText=d.message);
}

function login(){
fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:username.value,password:password.value})})
.then(r=>r.json()).then(d=>{
if(d.message==="Success"){localStorage.setItem("user",d.username);location.href="quiz.html";}
else msg.innerText=d.message;
});
}

function loadQuiz(){
fetch(API+"/questions").then(r=>r.json()).then(data=>{
let html="";
data.forEach((q,i)=>{
html+=`<div class="question">
<p>${i+1}. ${q.q}</p>
${q.options.map(opt=>`<label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label><br>`).join("")}
</div>`;
});
quiz.innerHTML=html;
localStorage.setItem("questions",JSON.stringify(data));
});
}

function submitQuiz(){
let questions=JSON.parse(localStorage.getItem("questions"));
let score=0;

questions.forEach((q,i)=>{
let ans=document.querySelector(`input[name=q${i}]:checked`);
if(ans && ans.value===q.answer) score++;
});

localStorage.setItem("score",score);
location.href="result.html";
}

function showResult(){
score.innerText="Score: "+localStorage.getItem("score");
}

function logout(){
localStorage.clear();
location.href="index.html";
}

if(location.pathname.includes("quiz.html")) loadQuiz();
if(location.pathname.includes("result.html")) showResult();