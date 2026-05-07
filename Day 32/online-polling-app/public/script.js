const pollForm = document.getElementById("pollForm");
const questionInput = document.getElementById("question");
const extraOptions = document.getElementById("extraOptions");
const addOptionBtn = document.getElementById("addOptionBtn");
const pollList = document.getElementById("pollList");
const message = document.getElementById("message");

const voterIdKey = "online-polling-voter-id";
let refreshTimer = null;

function getVoterId() {
  let voterId = localStorage.getItem(voterIdKey);
  if (!voterId) {
    voterId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(voterIdKey, voterId);
  }

  return voterId;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function createOptionInput() {
  const label = document.createElement("label");
  label.innerHTML = `
    Option
    <input class="option-input" type="text" placeholder="Another option" required />
  `;
  extraOptions.appendChild(label);
}

function getOptionValues() {
  const inputs = document.querySelectorAll(".option-input");
  return Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((value) => value.length > 0);
}

function renderPolls(polls) {
  pollList.innerHTML = "";

  if (!polls.length) {
    pollList.innerHTML = '<p class="empty">No polls yet. Create one above.</p>';
    return;
  }

  const voterId = getVoterId();

  polls.forEach((poll) => {
    const card = document.createElement("article");
    card.className = "poll-card";

    const alreadyVoted = Array.isArray(poll.votedBy) && poll.votedBy.includes(voterId);
    const optionsMarkup = poll.options
      .map(
        (option) => `
          <div class="option-row">
            <div>
              <div class="option-text">${option.text}</div>
              <div class="option-votes">Votes: ${option.votes}</div>
            </div>
            <button class="vote-btn" data-poll-id="${poll.id}" data-option-id="${option.id}" ${alreadyVoted ? "disabled" : ""}>
              ${alreadyVoted ? "Voted" : "Vote"}
            </button>
          </div>
        `
      )
      .join("");

    card.innerHTML = `
      <h3>${poll.question}</h3>
      ${optionsMarkup}
    `;

    card.querySelectorAll(".vote-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const pollId = btn.getAttribute("data-poll-id");
        const optionId = btn.getAttribute("data-option-id");

        const response = await fetch(`/api/polls/${pollId}/vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ optionId, voterId: getVoterId() })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          showMessage(result.error || "Could not submit vote.", "error");
          return;
        }

        showMessage("Vote submitted.", "success");
        await loadPolls();
      });
    });

    pollList.appendChild(card);
  });
}

async function loadPolls() {
  const response = await fetch("/api/polls");
  const polls = await response.json();
  renderPolls(polls);
}

pollForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();
  const options = getOptionValues();

  if (!question || options.length < 2) {
    showMessage("Please provide a question and at least 2 options.", "error");
    return;
  }

  const response = await fetch("/api/polls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, options })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to create poll.", "error");
    return;
  }

  pollForm.reset();
  extraOptions.innerHTML = "";
  showMessage("Poll created.", "success");
  await loadPolls();
});

addOptionBtn.addEventListener("click", createOptionInput);

loadPolls();
refreshTimer = setInterval(loadPolls, 3000);
window.addEventListener("beforeunload", () => clearInterval(refreshTimer));
