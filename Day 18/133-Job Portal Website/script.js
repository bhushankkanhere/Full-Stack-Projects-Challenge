const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const locationFilter = document.getElementById('locationFilter');
const typeFilter = document.getElementById('typeFilter');
const companyFilter = document.getElementById('companyFilter');
const jobsList = document.getElementById('jobsList');
const jobCount = document.getElementById('jobCount');
const fastApplyCount = document.getElementById('fastApplyCount');
const lastUpdated = document.getElementById('lastUpdated');
const resultMessage = document.getElementById('resultMessage');
const quickTags = document.querySelectorAll('.tag-btn');
const applyModal = document.getElementById('applyModal');
const modalClose = document.getElementById('modalClose');
const modalJobTitle = document.getElementById('modalJobTitle');
const applyForm = document.getElementById('applyForm');
const applicantName = document.getElementById('applicantName');
const applicantEmail = document.getElementById('applicantEmail');
const applicantMessage = document.getElementById('applicantMessage');
const applyStatus = document.getElementById('applyStatus');

let currentJobId = null;
let allJobs = [];

function formatPostedDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getQueryParams() {
  const params = new URLSearchParams();
  const search = searchInput.value.trim();
  if (search) params.set('search', search);
  if (locationFilter.value) params.set('location', locationFilter.value);
  if (typeFilter.value) params.set('type', typeFilter.value);
  if (companyFilter.value) params.set('company', companyFilter.value);
  return params.toString();
}

function renderJobs(jobs) {
  jobsList.innerHTML = '';
  if (!jobs.length) {
    resultMessage.textContent = 'No matching jobs found. Try another filter or search term.';
    jobCount.textContent = '0';
    fastApplyCount.textContent = '0';
    return;
  }

  resultMessage.textContent = `${jobs.length} roles matching your search.`;
  jobCount.textContent = jobs.length;
  fastApplyCount.textContent = jobs.filter(job => job.fastApply).length;

  jobs.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-card';
    card.innerHTML = `
      <header>
        <div>
          <h3>${job.title}</h3>
          <p class="job-badge">${job.company}</p>
        </div>
        <div class="job-actions">
          <span class="job-tag">${job.type}</span>
          <button class="view-btn" data-id="${job.id}">Details</button>
          <button class="apply-btn" data-id="${job.id}">Apply</button>
        </div>
      </header>
      <div class="job-meta">
        <span>Location: ${job.location}</span>
        <span>Salary: ${job.salary}</span>
        <span>Experience: ${job.experience}</span>
        <span>Posted: ${formatPostedDate(job.postedAt)}</span>
      </div>
      <div class="job-details">
        <p>${job.description}</p>
        <p><strong>Skills:</strong> ${job.tags.join(', ')}</p>
      </div>
    `;
    jobsList.appendChild(card);
  });
}

async function populateFilters(jobs) {
  const locations = [...new Set(jobs.map(job => job.location))].sort();
  const companies = [...new Set(jobs.map(job => job.company))].sort();

  locationFilter.innerHTML = '<option value="">All locations</option>' + locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  companyFilter.innerHTML = '<option value="">All companies</option>' + companies.map(company => `<option value="${company}">${company}</option>`).join('');
}

async function fetchJobs() {
  const query = getQueryParams();
  const response = await fetch(`/jobs${query ? `?${query}` : ''}`);
  const data = await response.json();
  allJobs = data.jobs;
  renderJobs(data.jobs);
  lastUpdated.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (data.meta) {
    resultMessage.textContent = data.meta.message;
  }
}

function openApplyModal(jobId) {
  const job = allJobs.find(item => item.id === jobId);
  if (!job) return;
  currentJobId = jobId;
  modalJobTitle.textContent = `${job.title} at ${job.company}`;
  applicantName.value = '';
  applicantEmail.value = '';
  applicantMessage.value = '';
  applyStatus.textContent = '';
  applyModal.classList.remove('hidden');
}

function closeApplyModal() {
  applyModal.classList.add('hidden');
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  fetchJobs();
});

quickTags.forEach(button => {
  button.addEventListener('click', () => {
    searchInput.value = button.textContent;
    fetchJobs();
  });
});

locationFilter.addEventListener('change', fetchJobs);
companyFilter.addEventListener('change', fetchJobs);
typeFilter.addEventListener('change', fetchJobs);

jobsList.addEventListener('click', event => {
  const applyButton = event.target.closest('.apply-btn');
  const viewButton = event.target.closest('.view-btn');
  if (applyButton) {
    openApplyModal(applyButton.dataset.id);
  }
  if (viewButton) {
    openApplyModal(viewButton.dataset.id);
  }
});

modalClose.addEventListener('click', closeApplyModal);
applyModal.addEventListener('click', event => {
  if (event.target === applyModal) closeApplyModal();
});

applyForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentJobId) return;
  const payload = {
    jobId: currentJobId,
    name: applicantName.value.trim(),
    email: applicantEmail.value.trim(),
    message: applicantMessage.value.trim()
  };

  if (!payload.name || !payload.email) {
    applyStatus.textContent = 'Please enter your name and email.';
    return;
  }

  const response = await fetch('/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (response.ok) {
    applyStatus.textContent = result.message;
    applyStatus.style.color = '#7cffa6';
  } else {
    applyStatus.textContent = result.message || 'Application not submitted.';
    applyStatus.style.color = '#ff9faa';
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  await fetchJobs();
  setInterval(fetchJobs, 30000);
});
