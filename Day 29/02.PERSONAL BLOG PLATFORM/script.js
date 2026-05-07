const API = "http://localhost:3001/posts";

async function loadPosts(){

const res = await fetch(API);
const posts = await res.json();

const postDiv = document.getElementById("posts");
postDiv.innerHTML="";

posts.forEach(post => {

postDiv.innerHTML += `
<div class="post">
<h3>${post.title}</h3>
<p>${post.content}</p>
<button class="delete" onclick="deletePost(${post.id})">Delete</button>
</div>
`;

});

}

async function addPost(){

const title = document.getElementById("title").value;
const content = document.getElementById("content").value;

await fetch(API,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({title,content})
});

loadPosts();

}

async function deletePost(id){

await fetch(API+"/"+id,{
method:"DELETE"
});

loadPosts();

}

loadPosts();