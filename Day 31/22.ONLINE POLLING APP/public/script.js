const pollQuestion = document.getElementById('pollQuestion');
const optionsDiv = document.getElementById('options');
const resultsDiv = document.getElementById('results');

let poll = {};
let results = {};

async function loadPoll() {
    const res = await fetch('/poll');
    poll = await res.json();

    pollQuestion.textContent = poll.question;
    optionsDiv.innerHTML = '';

    poll.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => vote(opt);
        optionsDiv.appendChild(btn);
    });

    loadResults();
}

async function vote(option) {
    await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option })
    });
    loadResults();
}

async function loadResults() {
    const res = await fetch('/results');
    results = await res.json();

    resultsDiv.innerHTML = '';
    for (const [opt, count] of Object.entries(results)) {
        const div = document.createElement('div');
        div.className = 'result-card';
        div.textContent = `${opt}: ${count} votes`;
        resultsDiv.appendChild(div);
    }
}

loadPoll();