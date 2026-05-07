const form = document.getElementById("subscribeForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const subscriberList = document.getElementById("subscriberList");
const count = document.getElementById("count");

function showMessage(text, kind) {
  message.textContent = text;
  message.className = `message ${kind}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function loadSubscribers() {
  const response = await fetch("/api/subscribers");
  const subscribers = await response.json();

  subscriberList.innerHTML = "";
  count.textContent = String(subscribers.length);

  if (!subscribers.length) {
    subscriberList.innerHTML = '<p class="empty">No subscribers yet.</p>';
    return;
  }

  subscribers.forEach((subscriber) => {
    const item = document.createElement("article");
    item.className = "item";

    item.innerHTML = `
      <span class="email">${subscriber.email}</span>
      <button class="delete-btn" data-id="${subscriber.id}">Delete</button>
    `;

    item.querySelector(".delete-btn").addEventListener("click", async () => {
      await fetch(`/api/subscribers/${subscriber.id}`, { method: "DELETE" });
      await loadSubscribers();
    });

    subscriberList.appendChild(item);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  const response = await fetch("/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Subscription failed.", "error");
    return;
  }

  emailInput.value = "";
  showMessage("Subscribed successfully.", "success");
  await loadSubscribers();
});

loadSubscribers();
