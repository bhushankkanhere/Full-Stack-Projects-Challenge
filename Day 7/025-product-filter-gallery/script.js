const catalog = [
  { name: "UI Kit Pro", category: "Design", price: 49, rating: 4.8, description: "Interface components for dashboards and landing pages." },
  { name: "Landing Hero Pack", category: "Design", price: 29, rating: 4.3, description: "Hero sections, banners, and CTA layouts." },
  { name: "React Admin Course", category: "Course", price: 89, rating: 4.9, description: "Build real admin interfaces with reusable architecture." },
  { name: "JavaScript Interview Notes", category: "Ebook", price: 19, rating: 4.1, description: "Core concepts, snippets, and interview revisions." },
  { name: "CSS Animation Lab", category: "Course", price: 59, rating: 4.7, description: "Transitions, keyframes, timing, and interaction design." },
  { name: "Productivity Icons", category: "Asset", price: 15, rating: 4.0, description: "A compact icon pack for web and mobile products." },
  { name: "Wireframe Blocks", category: "Asset", price: 22, rating: 4.4, description: "Low-fidelity blocks for quick app ideation." },
  { name: "Frontend Testing Guide", category: "Ebook", price: 35, rating: 4.6, description: "Testing flows, coverage ideas, and browser strategy." }
];

const productsEl = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

function renderCategories() {
  const categories = [...new Set(catalog.map((item) => item.category))];
  categorySelect.innerHTML += categories.map((category) => `<option value="${category}">${category}</option>`).join("");
}

function renderProducts() {
  let filtered = [...catalog];
  const search = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;
  if (search) filtered = filtered.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search));
  if (category !== "all") filtered = filtered.filter((item) => item.category === category);
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") filtered.sort((a, b) => b.rating - a.rating);
  productsEl.innerHTML = filtered.map((item) => `
    <article class="product">
      <span class="badge">${item.category}</span>
      <h2>${item.name}</h2>
      <p>${item.description}</p>
      <div class="meta">
        <strong>$${item.price}</strong>
        <span>Rating ${item.rating}</span>
      </div>
    </article>
  `).join("");
}

[searchInput, categorySelect, sortSelect].forEach((element) => {
  element.addEventListener("input", renderProducts);
  element.addEventListener("change", renderProducts);
});

renderCategories();
renderProducts();
