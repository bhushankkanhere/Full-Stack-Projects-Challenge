const form = document.getElementById("uploadForm");
const gallery = document.getElementById("gallery");

async function loadImages() {
    const res = await fetch("/images");
    const images = await res.json();

    gallery.innerHTML = "";
    images.forEach(img => {
        gallery.innerHTML += `<img src="${img}">`;
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("image");
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    await fetch("/upload", {
        method: "POST",
        body: formData
    });

    fileInput.value = "";
    loadImages();
});

loadImages();