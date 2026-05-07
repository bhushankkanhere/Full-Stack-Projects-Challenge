const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4006;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ decks: [] }, null, 2));
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

    if (req.method === 'GET' && url.pathname === '/api/decks') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.decks));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/decks') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const deck = JSON.parse(body);
            deck.id = Date.now().toString();
            deck.createdAt = new Date().toISOString();
            deck.reviewed = 0;
            data.decks.push(deck);
            writeData(data);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deck));
        });
        return;
    }

    if (req.method === 'PUT' && url.pathname.match(/^\/api\/decks\/[^/]+$/)) {
        const id = url.pathname.split('/').pop();
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const idx = data.decks.findIndex(d => d.id === id);
            if (idx >= 0) {
                data.decks[idx] = { ...data.decks[idx], ...JSON.parse(body) };
                writeData(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data.decks[idx]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });
        return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/decks/')) {
        const id = url.pathname.split('/').pop();
        const data = readData();
        data.decks = data.decks.filter(d => d.id !== id);
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Quiz & Flashcard App running on http://localhost:${PORT}`);
});
