const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4007;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ links: [] }, null, 2));
}

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
        return;
    }

    if (req.method === 'GET' && url.pathname === '/api/links') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.links));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/links') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const { originalUrl } = JSON.parse(body);
            const shortCode = generateShortCode();
            const link = {
                id: Date.now().toString(),
                originalUrl,
                shortCode,
                shortUrl: `http://localhost:${PORT}/${shortCode}`,
                clicks: 0,
                createdAt: new Date().toISOString()
            };
            data.links.push(link);
            writeData(data);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(link));
        });
        return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/links/')) {
        const id = url.pathname.split('/').pop();
        const data = readData();
        data.links = data.links.filter(l => l.id !== id);
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    // Redirect short URLs
    const shortCode = url.pathname.slice(1);
    if (shortCode) {
        const data = readData();
        const link = data.links.find(l => l.shortCode === shortCode);
        if (link) {
            link.clicks++;
            writeData(data);
            res.writeHead(302, { 'Location': link.originalUrl });
            res.end();
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`URL Shortener Service running on http://localhost:${PORT}`);
});
