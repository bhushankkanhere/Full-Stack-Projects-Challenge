const productForm = document.getElementById("productForm");
const reviewForm = document.getElementById("reviewForm");
const productNameInput = document.getElementById("productName");
const productSelect = document.getElementById("productSelect");
const commentInput = document.getElementById("comment");
const ratingValue = document.getElementById("ratingValue");
const starRating = document.getElementById("starRating");
const reviewList = document.getElementById("reviewList");
const message = document.getElementById("message");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function updateStars(value) {
  const stars = starRating.querySelectorAll(".star");
  stars.forEach((star) => {
    const starValue = Number(star.getAttribute("data-value"));
    star.classList.toggle("active", starValue <= value);
  });
}

function renderProducts(products) {
  const defaultOption = '<option value="">Choose product</option>';

  if (!products.length) {
    productSelect.innerHTML = `${defaultOption}<option value="" disabled>No products added yet</option>`;
    return;
  }

  const options = products
    .map((product) => `<option value="${product.id}">${product.name}</option>`)
    .join("");

  productSelect.innerHTML = defaultOption + options;
}

function makeStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function renderReviews(reviews) {
  reviewList.innerHTML = "";

  if (!reviews.length) {
    reviewList.innerHTML = '<p class="empty">No reviews yet.</p>';
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";

    card.innerHTML = `
      <div class="review-head">
        <span class="product-name">${review.productName}</span>
        <span class="rating-text">${makeStars(review.rating)} (${review.rating}/5)</span>
      </div>
      <p>${review.comment}</p>
      <button class="delete-btn" data-id="${review.id}">Delete Review</button>
    `;

    card.querySelector(".delete-btn").addEventListener("click", async () => {
      await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      showMessage("Review deleted.", "success");
      await loadData();
    });

    reviewList.appendChild(card);
  });
}

async function loadData() {
  const [productsRes, reviewsRes] = await Promise.all([
    fetch("/api/products"),
    fetch("/api/reviews")
  ]);

  const products = await productsRes.json();
  const reviews = await reviewsRes.json();

  renderProducts(products);
  renderReviews(reviews);
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = productNameInput.value.trim();
  if (!name) {
    showMessage("Please enter a product name.", "error");
    return;
  }

  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to add product.", "error");
    return;
  }

  productForm.reset();
  showMessage("Product added.", "success");
  await loadData();
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productId = productSelect.value;
  const rating = Number(ratingValue.value);
  const comment = commentInput.value.trim();

  if (!productId || rating < 1 || rating > 5 || !comment) {
    showMessage("Choose product, select rating, and write comment.", "error");
    return;
  }

  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ productId, rating, comment })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to add review.", "error");
    return;
  }

  reviewForm.reset();
  ratingValue.value = "0";
  updateStars(0);
  showMessage("Review submitted.", "success");
  await loadData();
});

starRating.querySelectorAll(".star").forEach((star) => {
  star.addEventListener("click", () => {
    const value = Number(star.getAttribute("data-value"));
    ratingValue.value = String(value);
    updateStars(value);
  });
});

loadData();
