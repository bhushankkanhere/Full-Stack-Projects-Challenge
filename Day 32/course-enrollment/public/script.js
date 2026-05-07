const courseForm = document.getElementById("courseForm");
const enrollmentForm = document.getElementById("enrollmentForm");
const courseTitleInput = document.getElementById("courseTitle");
const studentNameInput = document.getElementById("studentName");
const courseSelect = document.getElementById("courseSelect");
const enrollmentList = document.getElementById("enrollmentList");
const message = document.getElementById("message");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function renderCourseOptions(courses) {
  const defaultOption = '<option value="">Choose a course</option>';

  if (!courses.length) {
    courseSelect.innerHTML = `${defaultOption}<option value="" disabled>No courses available</option>`;
    return;
  }

  const options = courses
    .map((course) => `<option value="${course.id}">${course.title}</option>`)
    .join("");

  courseSelect.innerHTML = defaultOption + options;
}

function renderEnrollments(enrollments) {
  enrollmentList.innerHTML = "";

  if (!enrollments.length) {
    enrollmentList.innerHTML = '<p class="empty">No enrollments yet.</p>';
    return;
  }

  enrollments.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "item";

    card.innerHTML = `
      <p><span class="label">Student:</span> ${entry.studentName}</p>
      <p><span class="label">Course:</span> ${entry.courseTitle}</p>
      <p><span class="label">Enrolled:</span> ${new Date(entry.enrolledAt).toLocaleString()}</p>
    `;

    enrollmentList.appendChild(card);
  });
}

async function loadData() {
  const [coursesResponse, enrollmentsResponse] = await Promise.all([
    fetch("/api/courses"),
    fetch("/api/enrollments")
  ]);

  const courses = await coursesResponse.json();
  const enrollments = await enrollmentsResponse.json();

  renderCourseOptions(courses);
  renderEnrollments(enrollments);
}

courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = courseTitleInput.value.trim();
  if (!title) {
    showMessage("Please enter a course title.", "error");
    return;
  }

  const response = await fetch("/api/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to add course.", "error");
    return;
  }

  courseForm.reset();
  showMessage("Course added successfully.", "success");
  await loadData();
});

enrollmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const studentName = studentNameInput.value.trim();
  const courseId = courseSelect.value;

  if (!studentName || !courseId) {
    showMessage("Please enter student name and choose a course.", "error");
    return;
  }

  const response = await fetch("/api/enrollments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ studentName, courseId })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.error || "Failed to enroll student.", "error");
    return;
  }

  enrollmentForm.reset();
  showMessage("Student enrolled successfully.", "success");
  await loadData();
});

loadData();
