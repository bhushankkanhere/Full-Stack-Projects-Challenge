const voteForm = document.getElementById('voteForm');
const candidateSelect = document.getElementById('candidate');
const resultsDiv = document.getElementById('results');

async function loadCandidates() {
    const res = await fetch('/candidates');
    const candidates = await res.json();

    candidateSelect.innerHTML = '<option value="">Select Candidate</option>';
    candidates.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.textContent = c.name;
        candidateSelect.appendChild(option);
    });
}

voteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const voteData = {
        voterName: document.getElementById('voterName').value,
        candidate: document.getElementById('candidate').value
    };

    await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData)
    });

    voteForm.reset();
    loadResults();
});

async function loadResults() {
    const res = await fetch('/results');
    const results = await res.json();

    resultsDiv.innerHTML = '';
    results.forEach(r => {
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `<strong>${r.name}</strong>: ${r.votes} votes`;
        resultsDiv.appendChild(div);
    });
}

loadCandidates();
loadResults();