const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3009;
const HOST = '127.0.0.1';
const DATA_FILE = path.join(__dirname, 'books.json');

// Create file if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

// Read books
function readBooks() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch {
        return [];
    }
}

// Write books
function writeBooks(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Send JSON
function send(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
}

// Server
const server = http.createServer((req, res) => {

    // ✅ Serve frontend files
    if (!req.url.startsWith('/api')) {
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);

            const types = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript'
            };

            res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
            res.end(fs.readFileSync(filePath));
        } else {
            res.writeHead(404);
            res.end('File not found');
        }
        return;
    }

    // ✅ GET books
    if (req.method === 'GET' && req.url === '/api/books') {
        return send(res, 200, readBooks());
    }

    // ✅ POST book (FIXED BODY PARSE)
    if (req.method === 'POST' && req.url === '/api/books') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                if (!data.title || !data.author || !data.pages) {
                    return send(res, 400, { error: 'Missing fields' });
                }

                const books = readBooks();

                const newBook = {
                    id: Date.now().toString(),
                    title: data.title,
                    author: data.author,
                    pages: parseInt(data.pages),
                    currentPage: parseInt(data.currentPage) || 0,
                    genre: data.genre || '',
                    status: data.status || 'Want to Read',
                    rating: data.rating || 0,
                    notes: data.notes || '',
                    createdAt: new Date().toISOString()
                };

                books.push(newBook);
                writeBooks(books);

                send(res, 201, newBook);
            } catch (err) {
                console.error(err);
                send(res, 400, { error: 'Invalid JSON' });
            }
        });

        return;
    }

    // ✅ DELETE book
    if (req.method === 'DELETE' && req.url.startsWith('/api/books/')) {
        const id = req.url.split('/').pop();
        let books = readBooks();

        books = books.filter(b => b.id !== id);
        writeBooks(books);

        return send(res, 200, { message: 'Deleted' });
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});