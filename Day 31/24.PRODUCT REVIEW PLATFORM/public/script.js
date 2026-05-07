const form = document.getElementById("reviewForm");
const reviewsDiv = document.getElementById("reviews");

async function loadReviews() {
    const res = await fetch("/reviews");
    const data = await res.json();

    reviewsDiv.innerHTML = "";
    data.forEach(r => {
        reviewsDiv.innerHTML += `
            <div class="review">
                <h3>${r.product}</h3>
                <p><b>${r.user}</b> - ${"⭐".repeat(r.rating)}</p>
                <p>${r.comment}</p>
            </div>
        `;
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const review = {
        product: document.getElementById("product").value,
        user: document.getElementById("user").value,
        rating: document.getElementById("rating").value,
        comment: document.getElementById("comment").value
    };

    await fetch("/add-review", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(review)
    });

    form.reset();
    loadReviews();
});

loadReviews();