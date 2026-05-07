const form = document.getElementById("attendanceForm");
const attendanceList = document.getElementById("attendanceList");

async function loadAttendance() {
    const res = await fetch("/attendance");
    const data = await res.json();
    attendanceList.innerHTML = "";
    data.forEach(a => {
        const div = document.createElement("div");
        div.classList.add("record");
        div.innerHTML = `<p><b>${a.name}</b> | ${a.date} | ${a.status}</p>`;
        attendanceList.appendChild(div);
    });
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const record = {
        name: document.getElementById("studentName").value,
        date: document.getElementById("date").value,
        status: document.getElementById("status").value
    };
    await fetch("/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    });
    form.reset();
    loadAttendance();
});

loadAttendance();