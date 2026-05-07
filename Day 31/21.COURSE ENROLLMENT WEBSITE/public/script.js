const form = document.getElementById('enrollForm');
const courseSelect = document.getElementById('courseSelect');
const enrollmentsDiv = document.getElementById('enrollments');

async function loadCourses() {
    const res = await fetch('/courses');
    const courses = await res.json();

    courseSelect.innerHTML = '<option value="">Select a Course</option>';
    courses.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.textContent = c.name;
        courseSelect.appendChild(option);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        course: document.getElementById('courseSelect').value
    };

    await fetch('/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    loadEnrollments();
});

async function loadEnrollments() {
    const res = await fetch('/enrollments');
    const enrollments = await res.json();

    enrollmentsDiv.innerHTML = '';
    enrollments.forEach(e => {
        const div = document.createElement('div');
        div.className = 'enrollment-card';
        div.innerHTML = `<strong>${e.name}</strong> enrolled in <em>${e.course}</em> (<span>${e.email}</span>)`;
        enrollmentsDiv.appendChild(div);
    });
}

loadCourses();
loadEnrollments();