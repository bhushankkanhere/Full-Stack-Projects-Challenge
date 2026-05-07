const form = document.getElementById("entryForm");
const dateInput = document.getElementById("date");
const textInput = document.getElementById("text");
const entriesContainer = document.getElementById("entries");

async function loadEntries() {
  const response = await fetch("/api/entries");
  const entries = await response.json();

  entriesContainer.innerHTML = "";

  if (!entries.length) {
    entriesContainer.innerHTML = '<p class="empty-state">No diary entries yet.</p>';
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry-card";

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-date">${entry.date}</span>
        <button class="delete-btn" data-id="${entry.id}">Delete</button>
      </div>
      <p>${entry.text}</p>
    `;

    const deleteButton = card.querySelector(".delete-btn");
    deleteButton.addEventListener("click", async () => {
      await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
      loadEntries();
    });

    entriesContainer.appendChild(card);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    date: dateInput.value,
    text: textInput.value
  };

  const response = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    alert("Please add both date and text.");
    return;
  }

  form.reset();
  loadEntries();
});

dateInput.valueAsDate = new Date();
loadEntries();
