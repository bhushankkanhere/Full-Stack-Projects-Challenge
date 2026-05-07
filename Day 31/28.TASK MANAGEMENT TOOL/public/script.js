const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

async function loadTasks() {
    const res = await fetch("/tasks");
    const data = await res.json();
    taskList.innerHTML = "";
    data.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("task");
        div.innerHTML = `<h3>${t.title}</h3><p>${t.description}</p>`;
        taskList.appendChild(div);
    });
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const task = {
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDesc").value
    };
    await fetch("/add-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
    form.reset();
    loadTasks();
});

loadTasks();