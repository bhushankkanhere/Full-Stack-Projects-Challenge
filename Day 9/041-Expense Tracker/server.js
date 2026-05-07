const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3002;
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Initialize entries file if it doesn't exist
if (!fs.existsSync(ENTRIES_FILE)) {
    fs.writeFileSync(ENTRIES_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
        serveFile(path.join(__dirname, 'index.html'), 'text/html', res);
    } else if (pathname === '/style.css') {
        serveFile(path.join(__dirname, 'style.css'), 'text/css', res);
    } else if (pathname === '/script.js') {
        serveFile(path.join(__dirname, 'script.js'), 'application/javascript', res);
    }
    // API routes
    else if (pathname === '/api/entries' && req.method === 'GET') {
        handleGetEntries(res);
    } else if (pathname === '/api/entries' && req.method === 'POST') {
        handlePostEntry(req, res);
    } else if (pathname.startsWith('/api/entries/') && (req.method === 'PUT' || req.method === 'DELETE')) {
        const id = pathname.split('/')[3];
        if (req.method === 'PUT') {
            handlePutEntry(req, res, id);
        } else {
            handleDeleteEntry(res, id);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function handleGetEntries(res) {
    try {
        const entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(entries));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read entries' }));
    }
}

function handlePostEntry(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            
            // Validate required fields
            if (!data.title || data.title.trim().length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Title is required' }));
                return;
            }

            if (data.title.length > 100) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Title must be less than 100 characters' }));
                return;
            }

            if (!data.amount || data.amount <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Amount must be greater than 0' }));
                return;
            }

            if (!data.type || !['income', 'expense'].includes(data.type)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid type. Must be income or expense' }));
                return;
            }

            const entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
            
            const newEntry = {
                id: Date.now().toString(),
                title: data.title.trim(),
                amount: parseFloat(data.amount),
                type: data.type,
                category: data.category || 'Other',
                date: data.date || new Date().toISOString(),
                description: data.description ? data.description.trim().substring(0, 500) : '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            entries.push(newEntry);
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newEntry));
        } catch (error) {
            console.error('Error creating entry:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to create entry' }));
        }
    });
}

function handlePutEntry(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
            
            const entryIndex = entries.findIndex(entry => entry.id === id);
            if (entryIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Entry not found' }));
                return;
            }

            // Validate title if provided
            if (data.title !== undefined) {
                if (data.title.trim().length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Title cannot be empty' }));
                    return;
                }
                if (data.title.length > 100) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Title must be less than 100 characters' }));
                    return;
                }
            }

            // Validate amount if provided
            if (data.amount !== undefined && data.amount <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Amount must be greater than 0' }));
                return;
            }

            // Update entry fields
            entries[entryIndex] = {
                ...entries[entryIndex],
                title: data.title !== undefined ? data.title.trim() : entries[entryIndex].title,
                amount: data.amount !== undefined ? parseFloat(data.amount) : entries[entryIndex].amount,
                type: data.type !== undefined ? data.type : entries[entryIndex].type,
                category: data.category !== undefined ? data.category : entries[entryIndex].category,
                date: data.date !== undefined ? data.date : entries[entryIndex].date,
                description: data.description !== undefined ? data.description.trim().substring(0, 500) : entries[entryIndex].description,
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(entries[entryIndex]));
        } catch (error) {
            console.error('Error updating entry:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to update entry' }));
        }
    });
}

function handleDeleteEntry(res, id) {
    try {
        const entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
        const filteredEntries = entries.filter(entry => entry.id !== id);
        
        if (filteredEntries.length === entries.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Entry not found' }));
            return;
        }
        
        fs.writeFileSync(ENTRIES_FILE, JSON.stringify(filteredEntries, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Entry deleted successfully' }));
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete entry' }));
    }
}

server.listen(PORT, () => {
    console.log(`Expense Tracker Server running at http://localhost:${PORT}`);
});
