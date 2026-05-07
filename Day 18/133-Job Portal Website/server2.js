const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const staticFolder = path.join(__dirname, '2. Job Portal Website');

app.use(cors());
app.use(express.json());
app.use(express.static(staticFolder));

const jobs = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    company: 'TeraTech',
    location: 'Mumbai',
    type: 'Full-time',
    salary: '₹20L - ₹28L / yr',
    experience: '5+ years',
    postedAt: '2026-04-09T08:20:00Z',
    description: 'Build scalable product platforms and lead a high-performance engineering team.',
    tags: ['Node.js', 'AWS', 'Microservices', 'Leadership'],
    fastApply: true
  },
  {
    id: 'job-002',
    title: 'Product Manager',
    company: 'PulsePay',
    location: 'Delhi',
    type: 'Full-time',
    salary: '₹16L - ₹22L / yr',
    experience: '4+ years',
    postedAt: '2026-04-08T10:15:00Z',
    description: 'Lead payments product strategy, roadmap, and cross-functional delivery.',
    tags: ['Product', 'FinTech', 'User Research', 'Roadmap'],
    fastApply: false
  },
  {
    id: 'job-003',
    title: 'Data Analyst',
    company: 'DataVista',
    location: 'Bengaluru',
    type: 'Contract',
    salary: '₹8L - ₹12L / yr',
    experience: '2+ years',
    postedAt: '2026-04-10T06:30:00Z',
    description: 'Analyze large datasets, create dashboards, and help business teams make data-driven decisions.',
    tags: ['SQL', 'Power BI', 'Python', 'Analytics'],
    fastApply: true
  },
  {
    id: 'job-004',
    title: 'UX Designer',
    company: 'CloudCrest',
    location: 'Remote',
    type: 'Remote',
    salary: '₹14L - ₹18L / yr',
    experience: '3+ years',
    postedAt: '2026-04-05T12:00:00Z',
    description: 'Design intuitive SaaS experiences and collaborate closely with product and engineering teams.',
    tags: ['Figma', 'User Testing', 'Wireframes', 'Design System'],
    fastApply: false
  },
  {
    id: 'job-005',
    title: 'Frontend Developer',
    company: 'ByteLabs',
    location: 'Mumbai',
    type: 'Full-time',
    salary: '₹14L - ₹18L / yr',
    experience: '3+ years',
    postedAt: '2026-04-11T07:45:00Z',
    description: 'Build responsive web interfaces using React and modern frontend tooling.',
    tags: ['React', 'TypeScript', 'CSS', 'Responsive'],
    fastApply: true
  },
  {
    id: 'job-006',
    title: 'Cloud Engineer',
    company: 'GenomeAI',
    location: 'Bengaluru',
    type: 'Full-time',
    salary: '₹18L - ₹24L / yr',
    experience: '4+ years',
    postedAt: '2026-04-07T11:00:00Z',
    description: 'Deploy resilient cloud infrastructure and manage Kubernetes-based services.',
    tags: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    fastApply: false
  }
];

app.get('/jobs', (req, res) => {
  const searchText = (req.query.search || '').toLowerCase();
  const locationFilter = (req.query.location || '').toLowerCase();
  const typeFilter = (req.query.type || '').toLowerCase();
  const companyFilter = (req.query.company || '').toLowerCase();

  const filtered = jobs.filter(job => {
    const matchesSearch = searchText
      ? [job.title, job.company, job.location, job.description, ...job.tags]
          .some(value => value.toLowerCase().includes(searchText))
      : true;

    const matchesLocation = locationFilter ? job.location.toLowerCase() === locationFilter : true;
    const matchesType = typeFilter ? job.type.toLowerCase() === typeFilter : true;
    const matchesCompany = companyFilter ? job.company.toLowerCase() === companyFilter : true;

    return matchesSearch && matchesLocation && matchesType && matchesCompany;
  });

  res.json({
    jobs: filtered.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)),
    meta: { message: `${filtered.length} job openings found.` }
  });
});

app.post('/apply', (req, res) => {
  const { jobId, name, email, message } = req.body;
  if (!jobId || !name || !email) {
    return res.status(400).json({ message: 'Please provide job, name, and email.' });
  }

  const job = jobs.find(item => item.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  return res.json({
    message: `Application sent for ${job.title} at ${job.company}. We will contact you at ${email}.`
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(staticFolder, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Job portal server running at http://localhost:${PORT}`);
});
