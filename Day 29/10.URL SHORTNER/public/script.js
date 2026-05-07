const API = "http://localhost:3000";

function shorten(){
    const url = longUrl.value;
    fetch(API+"/shorten",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({longUrl:url})
    }).then(r=>r.json()).then(d=>{
        result.innerHTML = `Short URL: <a href="${d.shortUrl}" target="_blank">${d.shortUrl}</a>`;
    });
}