const form = document.getElementById("resumeForm");
const output = document.getElementById("resumeOutput");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        skills: document.getElementById("skills").value,
        education: document.getElementById("education").value,
        experience: document.getElementById("experience").value
    };

    await fetch("/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    output.innerHTML = `
        <h2>${data.name}</h2>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Phone:</b> ${data.phone}</p>
        <h3>Skills</h3>
        <p>${data.skills}</p>
        <h3>Education</h3>
        <p>${data.education}</p>
        <h3>Experience</h3>
        <p>${data.experience}</p>
    `;
});