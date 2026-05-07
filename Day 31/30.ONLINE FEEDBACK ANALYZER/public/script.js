const form = document.getElementById("feedbackForm");
const feedbackList = document.getElementById("feedbackList");

async function loadFeedbacks() {
    const res = await fetch("/feedbacks");
    const data = await res.json();
    feedbackList.innerHTML = "";
    data.forEach(f => {
        const div = document.createElement("div");
        div.classList.add("feedback");
        div.innerHTML = `<p>${f.text} <span>(${f.sentiment})</span></p>`;
        feedbackList.appendChild(div);
    });
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const feedbackText = document.getElementById("feedbackInput").value;
    await fetch("/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackText })
    });
    form.reset();
    loadFeedbacks();
});

loadFeedbacks();