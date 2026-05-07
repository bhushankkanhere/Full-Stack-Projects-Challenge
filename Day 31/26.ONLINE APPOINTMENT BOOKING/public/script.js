const form = document.getElementById("appointmentForm");
const list = document.getElementById("appointmentsList");

async function loadAppointments() {
    const res = await fetch("/appointments");
    const data = await res.json();
    list.innerHTML = "";
    data.forEach(a => {
        list.innerHTML += `
            <div class="appointment">
                <p><b>${a.name}</b> (${a.email}, ${a.phone})</p>
                <p>Date: ${a.date} | Time: ${a.time}</p>
            </div>
        `;
    });
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const appointment = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value
    };
    await fetch("/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment)
    });
    form.reset();
    loadAppointments();
});

loadAppointments();