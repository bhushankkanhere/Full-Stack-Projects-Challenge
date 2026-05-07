const resumeForm = document.getElementById("resumeForm");
const nameInput = document.getElementById("name");
const skillsInput = document.getElementById("skills");
const educationInput = document.getElementById("education");
const previewName = document.getElementById("previewName");
const previewSkills = document.getElementById("previewSkills");
const previewEducation = document.getElementById("previewEducation");
const resumePreview = document.getElementById("resumePreview");
const downloadBtn = document.getElementById("downloadBtn");
const printBtn = document.getElementById("printBtn");
const message = document.getElementById("message");

function parseLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function renderList(container, items, fallbackText) {
  if (!items.length) {
    container.innerHTML = `<li>${fallbackText}</li>`;
    return;
  }

  container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function updatePreview() {
  const name = nameInput.value.trim();
  const skills = parseLines(skillsInput.value);
  const education = parseLines(educationInput.value);

  previewName.textContent = name || "Your Name";
  renderList(previewSkills, skills, "Add skills to see preview");
  renderList(previewEducation, education, "Add education details to see preview");
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

nameInput.addEventListener("input", updatePreview);
skillsInput.addEventListener("input", updatePreview);
educationInput.addEventListener("input", updatePreview);

resumeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: nameInput.value,
    skills: skillsInput.value,
    education: educationInput.value
  };

  const response = await fetch("/api/resumes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Could not save resume.", "error");
    return;
  }

  showMessage("Resume saved successfully.", "success");
});

downloadBtn.addEventListener("click", () => {
  const name = (nameInput.value.trim() || "resume").replace(/\s+/g, "-").toLowerCase();
  const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title></head><body>${resumePreview.outerHTML}</body></html>`;
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${name}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showMessage("Resume downloaded as HTML.", "success");
});

printBtn.addEventListener("click", () => {
  window.print();
});

updatePreview();
