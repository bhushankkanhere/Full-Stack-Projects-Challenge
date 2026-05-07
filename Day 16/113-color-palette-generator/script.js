const paletteEl = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const totalColors = 5;
let locks = Array(totalColors).fill(false);
let colors = [];

function randomColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `#${hex}`;
}

function renderPalette() {
  paletteEl.innerHTML = colors.map((color, index) => `
    <article class="swatch" style="background:${color}">
      <div class="swatch-info">
        <button class="hex" data-copy="${color}">${color}</button>
        <button class="lock" data-lock="${index}">${locks[index] ? "Unlock" : "Lock"}</button>
      </div>
    </article>
  `).join("");
}

function generatePalette() {
  colors = colors.length ? colors.map((color, index) => (locks[index] ? color : randomColor())) : Array.from({ length: totalColors }, randomColor);
  renderPalette();
}

paletteEl.addEventListener("click", (event) => {
  const copy = event.target.dataset.copy;
  const lockIndex = event.target.dataset.lock;
  if (copy) {
    navigator.clipboard.writeText(copy);
    event.target.textContent = "Copied";
    setTimeout(() => { event.target.textContent = copy; }, 900);
  }
  if (lockIndex !== undefined) {
    locks[Number(lockIndex)] = !locks[Number(lockIndex)];
    renderPalette();
  }
});

generateBtn.addEventListener("click", generatePalette);
generatePalette();
