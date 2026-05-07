const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4008;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ polls: [] }, null, 2));
}

function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
        return;
    }

    if (req.method === 'GET' && url.pathname === '/api/polls') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.polls));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/polls') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const poll = JSON.parse(body);
            poll.id = Date.now().toString();
            poll.createdAt = new Date().toISOString();
            poll.totalVotes = 0;
            data.polls.push(poll);
            writeData(data);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(poll));
        });
        return;
    }

    if (req.method === 'POST' && url.pathname.match(/\/api\/polls\/.+\/vote$/)) {
        const id = url.pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const poll = data.polls.find(p => p.id === id);
            if (poll) {
                const { option } = JSON.parse(body);
                const opt = poll.options.find(o => o.text === option);
                if (opt) {
                    opt.votes++;
                    poll.totalVotes++;
                    writeData(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(poll));
                    return;
                }
            }
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        });
        return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/polls/')) {
        const id = url.pathname.split('/').pop();
        const data = readData();
        data.polls = data.polls.filter(p => p.id !== id);
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Poll & Survey Creator running on http://localhost:${PORT}`);
});
