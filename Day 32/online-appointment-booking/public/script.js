const appointmentForm = document.getElementById("appointmentForm");
const nameInput = document.getElementById("name");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const appointmentList = document.getElementById("appointmentList");
const calendarGrid = document.getElementById("calendarGrid");
const count = document.getElementById("count");
const message = document.getElementById("message");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function isFutureOrToday(dateText) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(`${dateText}T00:00:00`);
  return selected >= today;
}

function renderCalendar(appointments) {
  calendarGrid.innerHTML = "";

  const dateMap = appointments.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + 1;
    return acc;
  }, {});

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasAppointment = Boolean(dateMap[date]);

    const cell = document.createElement("div");
    cell.className = `calendar-day ${hasAppointment ? "has-appointment" : ""}`;
    cell.textContent = hasAppointment ? `${day} (${dateMap[date]})` : String(day);
    calendarGrid.appendChild(cell);
  }
}

function renderAppointments(appointments) {
  appointmentList.innerHTML = "";
  count.textContent = `${appointments.length} ${appointments.length === 1 ? "appointment" : "appointments"}`;

  if (!appointments.length) {
    appointmentList.innerHTML = '<p class="empty">No appointments booked yet.</p>';
    renderCalendar([]);
    return;
  }

  renderCalendar(appointments);

  appointments.forEach((appointment) => {
    const card = document.createElement("article");
    card.className = "appointment-card";

    card.innerHTML = `
      <div class="appointment-row">
        <div>
          <strong>${appointment.name}</strong>
          <p class="meta">${appointment.date} at ${appointment.time}</p>
        </div>
        <button class="cancel-btn" data-id="${appointment.id}">Cancel</button>
      </div>
    `;

    card.querySelector(".cancel-btn").addEventListener("click", async () => {
      await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      showMessage("Appointment cancelled.", "success");
      await loadAppointments();
    });

    appointmentList.appendChild(card);
  });
}

async function loadAppointments() {
  const response = await fetch("/api/appointments");
  const appointments = await response.json();
  renderAppointments(appointments);
}

appointmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;

  if (!name || !date || !time) {
    showMessage("Please fill in name, date, and time.", "error");
    return;
  }

  if (!isFutureOrToday(date)) {
    showMessage("Please choose today or a future date.", "error");
    return;
  }

  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, date, time })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Booking failed.", "error");
    return;
  }

  appointmentForm.reset();
  showMessage("Appointment booked.", "success");
  await loadAppointments();
});

loadAppointments();
