const imageForm = document.getElementById("imageForm");
const titleInput = document.getElementById("title");
const urlInput = document.getElementById("url");
const gallery = document.getElementById("gallery");
const count = document.getElementById("count");
const message = document.getElementById("message");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function isValidImageUrl(urlText) {
  return /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(urlText.trim());
}

function renderGallery(images) {
  gallery.innerHTML = "";
  count.textContent = `${images.length} ${images.length === 1 ? "image" : "images"}`;

  if (!images.length) {
    gallery.innerHTML = '<p class="empty">No images yet. Add one above.</p>';
    return;
  }

  images.forEach((image) => {
    const card = document.createElement("article");
    card.className = "image-card";

    card.innerHTML = `
      <div class="image-box">
        <img src="${image.url}" alt="${image.title}" loading="lazy" />
      </div>
      <div class="image-content">
        <p class="image-title">${image.title}</p>
        <button class="delete-btn" data-id="${image.id}">Delete</button>
      </div>
    `;

    card.querySelector(".delete-btn").addEventListener("click", async () => {
      await fetch(`/api/images/${image.id}`, { method: "DELETE" });
      showMessage("Image deleted.", "success");
      await loadImages();
    });

    gallery.appendChild(card);
  });
}

async function loadImages() {
  const response = await fetch("/api/images");
  const images = await response.json();
  renderGallery(images);
}

imageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!title || !url) {
    showMessage("Please enter title and image URL.", "error");
    return;
  }

  if (!isValidImageUrl(url)) {
    showMessage("Enter a valid image URL (http/https + image extension).", "error");
    return;
  }

  const response = await fetch("/api/images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, url })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to add image.", "error");
    return;
  }

  imageForm.reset();
  showMessage("Image added to gallery.", "success");
  await loadImages();
});

loadImages();
