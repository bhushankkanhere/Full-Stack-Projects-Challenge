const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4005;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ rules: [], files: [] }, null, 2));
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

    if (req.method === 'GET' && url.pathname === '/api/rules') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.rules));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/rules') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const rule = JSON.parse(body);
            rule.id = Date.now().toString();
            data.rules.push(rule);
            writeData(data);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rule));
        });
        return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/rules/')) {
        const id = url.pathname.split('/').pop();
        const data = readData();
        data.rules = data.rules.filter(r => r.id !== id);
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/organize') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = readData();
            const { files } = JSON.parse(body);
            const organized = {};
            let count = 0;
            
            files.forEach(f => {
                const ext = f.split('.').pop().toLowerCase();
                const rule = data.rules.find(r => r.extension.toLowerCase() === ext);
                const folder = rule ? rule.folder : 'Other';
                if (!organized[folder]) organized[folder] = [];
                organized[folder].push(f);
                count++;
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ organized, count }));
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`File Organizer Tool running on http://localhost:${PORT}`);
});
