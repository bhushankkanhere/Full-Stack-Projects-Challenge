const symbols = ["HTML", "CSS", "JS", "API", "DOM", "ARIA"];
const grid = document.getElementById("grid");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const restartBtn = document.getElementById("restartBtn");
let cards = [];
let opened = [];
let moves = 0;
let seconds = 0;
let timer;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function startTimer() {
  clearInterval(timer);
  seconds = 0;
  timeEl.textContent = "Time: 0s";
  timer = setInterval(() => {
    seconds += 1;
    timeEl.textContent = `Time: ${seconds}s`;
  }, 1000);
}

function renderGame() {
  grid.innerHTML = cards.map((card) => `
    <button class="card ${opened.includes(card.id) ? "flipped" : ""} ${card.matched ? "matched" : ""}" data-id="${card.id}">
      <span class="card-inner">
        <span class="face front">?</span>
        <span class="face back">${card.value}</span>
      </span>
    </button>
  `).join("");
}

function setupGame() {
  cards = shuffle([...symbols, ...symbols]).map((value, index) => ({ id: `${value}-${index}`, value, matched: false }));
  opened = [];
  moves = 0;
  movesEl.textContent = "Moves: 0";
  renderGame();
  startTimer();
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".card");
  if (!button) return;
  const id = button.dataset.id;
  const card = cards.find((item) => item.id === id);
  if (!card || card.matched || opened.includes(id) || opened.length === 2) return;
  opened.push(id);
  renderGame();
  if (opened.length === 2) {
    moves += 1;
    movesEl.textContent = `Moves: ${moves}`;
    const [firstId, secondId] = opened;
    const first = cards.find((item) => item.id === firstId);
    const second = cards.find((item) => item.id === secondId);
    if (first.value === second.value) {
      first.matched = true;
      second.matched = true;
      opened = [];
      renderGame();
      if (cards.every((item) => item.matched)) {
        clearInterval(timer);
        timeEl.textContent = `Complete in ${seconds}s`;
      }
    } else {
      setTimeout(() => {
        opened = [];
        renderGame();
      }, 800);
    }
  }
});

restartBtn.addEventListener("click", setupGame);
setupGame();
