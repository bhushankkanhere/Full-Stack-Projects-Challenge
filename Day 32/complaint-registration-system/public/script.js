const form = document.getElementById("complaintForm");
const nameInput = document.getElementById("name");
const issueInput = document.getElementById("issue");
const complaintsContainer = document.getElementById("complaints");

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString();
}

async function loadComplaints() {
  const response = await fetch("/api/complaints");
  const complaints = await response.json();

  complaintsContainer.innerHTML = "";

  if (!complaints.length) {
    complaintsContainer.innerHTML = '<p class="empty-state">No complaints yet.</p>';
    return;
  }

  complaints.forEach((complaint) => {
    const card = document.createElement("article");
    card.className = "entry-card";

    const isResolved = complaint.status === "resolved";

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-date">${complaint.name} | ${formatDate(complaint.createdAt)}</span>
        <span class="status-badge ${isResolved ? "resolved" : "pending"}">${complaint.status}</span>
      </div>
      <p>${complaint.issue}</p>
      <button class="resolve-btn" data-id="${complaint.id}" ${isResolved ? "disabled" : ""}>
        ${isResolved ? "Resolved" : "Mark as Resolved"}
      </button>
    `;

    const resolveButton = card.querySelector(".resolve-btn");

    if (!isResolved) {
      resolveButton.addEventListener("click", async () => {
        await fetch(`/api/complaints/${complaint.id}/resolve`, { method: "PATCH" });
        loadComplaints();
      });
    }

    complaintsContainer.appendChild(card);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: nameInput.value,
    issue: issueInput.value
  };

  const response = await fetch("/api/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    alert("Please add both name and issue.");
    return;
  }

  form.reset();
  loadComplaints();
});

loadComplaints();
