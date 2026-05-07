const form = document.getElementById("passwordForm");
const siteInput = document.getElementById("site");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const passwordList = document.getElementById("passwordList");
const entryCount = document.getElementById("entryCount");

function maskPassword(rawPassword) {
  return "*".repeat(Math.max(rawPassword.length, 8));
}

function createRow(label, value, extraClass = "") {
  return `
    <div class="entry-row">
      <span class="label">${label}</span>
      <span class="value ${extraClass}">${value}</span>
    </div>
  `;
}

async function fetchPasswords() {
  const response = await fetch("/api/passwords");
  return response.json();
}

async function renderPasswords() {
  const entries = await fetchPasswords();

  entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  passwordList.innerHTML = "";

  if (!entries.length) {
    passwordList.innerHTML = '<p class="empty">No saved passwords yet.</p>';
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry";

    const passwordId = `pwd-${entry.id}`;

    card.innerHTML = `
      ${createRow("Site", entry.site)}
      ${createRow("Username", entry.username)}
      ${createRow("Password", maskPassword(entry.password), "password-value")}
      <div class="actions">
        <button class="small-btn" data-action="toggle" data-target="${passwordId}">Show</button>
        <button class="small-btn delete-btn" data-action="delete" data-id="${entry.id}">Delete</button>
      </div>
      <input id="${passwordId}" type="hidden" value="${entry.password}" />
    `;

    const toggleBtn = card.querySelector('[data-action="toggle"]');
    const deleteBtn = card.querySelector('[data-action="delete"]');
    const hiddenInput = card.querySelector(`#${passwordId}`);
    const passwordValue = card.querySelector(".password-value");

    toggleBtn.addEventListener("click", () => {
      const isMasked = toggleBtn.textContent === "Show";
      passwordValue.textContent = isMasked ? hiddenInput.value : maskPassword(hiddenInput.value);
      toggleBtn.textContent = isMasked ? "Hide" : "Show";
    });

    deleteBtn.addEventListener("click", async () => {
      await fetch(`/api/passwords/${entry.id}`, { method: "DELETE" });
      await renderPasswords();
    });

    passwordList.appendChild(card);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    site: siteInput.value,
    username: usernameInput.value,
    password: passwordInput.value
  };

  const response = await fetch("/api/passwords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "Failed to save password.");
    return;
  }

  form.reset();
  await renderPasswords();
});

renderPasswords();
