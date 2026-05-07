const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3006;
const DATA_FILE = path.join(__dirname, 'bookmarks.json');

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper functions
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // API Routes
        if (pathname === '/api/bookmarks' && method === 'GET') {
            const bookmarks = readJsonFile(DATA_FILE);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(bookmarks));
            return;
        }

        if (pathname === '/api/bookmarks' && method === 'POST') {
            const bookmarks = readJsonFile(DATA_FILE);
            const newBookmark = await parseBody(req);
            newBookmark.id = generateId();
            newBookmark.createdAt = new Date().toISOString();
            newBookmark.updatedAt = new Date().toISOString();
            
            bookmarks.unshift(newBookmark);
            writeJsonFile(DATA_FILE, bookmarks);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newBookmark));
            return;
        }

        if (pathname.startsWith('/api/bookmarks/') && method === 'PUT') {
            const id = pathname.split('/').pop();
            const bookmarks = readJsonFile(DATA_FILE);
            const index = bookmarks.findIndex(b => b.id === id);
            
            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bookmark not found' }));
                return;
            }
            
            const updatedData = await parseBody(req);
            bookmarks[index] = { ...bookmarks[index], ...updatedData, updatedAt: new Date().toISOString() };
            writeJsonFile(DATA_FILE, bookmarks);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(bookmarks[index]));
            return;
        }

        if (pathname.startsWith('/api/bookmarks/') && method === 'DELETE') {
            const id = pathname.split('/').pop();
            let bookmarks = readJsonFile(DATA_FILE);
            const filtered = bookmarks.filter(b => b.id !== id);
            
            if (filtered.length === bookmarks.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bookmark not found' }));
                return;
            }
            
            bookmarks = filtered;
            writeJsonFile(DATA_FILE, bookmarks);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Bookmark deleted' }));
            return;
        }

        // Static file serving
        let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'text/html';

        if (fs.existsSync(filePath)) {
            const content = readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Not Found</h1>');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

server.listen(PORT, () => {
    console.log(`Bookmark Manager server running at http://localhost:${PORT}`);
});
