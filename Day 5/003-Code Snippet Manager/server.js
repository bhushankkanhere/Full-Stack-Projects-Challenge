const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4003;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ snippets: [] }, null, 2));
}

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
        return;
    }

    if (req.method === 'GET' && url.pathname === '/api/snippets') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.snippets));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/snippets') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const snippet = JSON.parse(body);
            snippet.id = Date.now().toString();
            snippet.createdAt = new Date().toISOString();
            data.snippets.push(snippet);
            writeData(data);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(snippet));
        });
        return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/snippets/')) {
        const id = url.pathname.split('/').pop();
        const data = readData();
        data.snippets = data.snippets.filter(s => s.id !== id);
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Code Snippet Manager running on http://localhost:${PORT}`);
});
