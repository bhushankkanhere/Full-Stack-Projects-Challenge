const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3004;
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Initialize data file
if (!fs.existsSync(ENTRIES_FILE)) {
    fs.writeFileSync(ENTRIES_FILE, JSON.stringify([]));
    console.log('Created entries.json file');
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${req.method} ${pathname}`);

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
    } else if (pathname.startsWith('/api/entries/') && req.method === 'PUT') {
        const id = pathname.split('/')[3];
        handlePutEntry(req, res, id);
    } else if (pathname.startsWith('/api/entries/') && req.method === 'DELETE') {
        const id = pathname.split('/')[3];
        handleDeleteEntry(res, id);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error serving file:', err);
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
        const data = fs.readFileSync(ENTRIES_FILE, 'utf8');
        
        if (!data || data.trim().length === 0) {
            const emptyEntries = [];
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify(emptyEntries, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(emptyEntries));
            return;
        }
        
        const entries = JSON.parse(data);
        
        if (!Array.isArray(entries)) {
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify([], null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(entries));
    } catch (error) {
        console.error('Error reading entries:', error);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
    }
}

function handlePostEntry(req, res) {
    let body = '';
    
    req.on('data', chunk => { body += chunk.toString(); });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            
            if (!data.title || !data.content || !data.mood) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Title, content, and mood are required' }));
                return;
            }
            
            const entriesData = fs.readFileSync(ENTRIES_FILE, 'utf8');
            const entries = JSON.parse(entriesData);
            
            const newEntry = {
                id: Date.now().toString(),
                date: data.date || new Date().toISOString().split('T')[0],
                title: data.title.trim(),
                mood: data.mood,
                category: data.category || 'personal',
                content: data.content.trim(),
                tags: data.tags || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            entries.push(newEntry);
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
            
            console.log(`✓ Created entry: ${newEntry.title}`);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newEntry));
        } catch (error) {
            console.error('Error adding entry:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to add entry' }));
        }
    });
}

function handlePutEntry(req, res, id) {
    let body = '';
    
    req.on('data', chunk => { body += chunk.toString(); });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const entriesData = fs.readFileSync(ENTRIES_FILE, 'utf8');
            const entries = JSON.parse(entriesData);
            
            const entryIndex = entries.findIndex(entry => entry.id === id);
            if (entryIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Entry not found' }));
                return;
            }
            
            if (data.date) entries[entryIndex].date = data.date;
            if (data.title) entries[entryIndex].title = data.title.trim();
            if (data.mood) entries[entryIndex].mood = data.mood;
            if (data.category) entries[entryIndex].category = data.category;
            if (data.content) entries[entryIndex].content = data.content.trim();
            if (data.tags !== undefined) entries[entryIndex].tags = data.tags;
            entries[entryIndex].updatedAt = new Date().toISOString();
            
            fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
            
            console.log(`✓ Updated entry: ${entries[entryIndex].title}`);
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
        const entriesData = fs.readFileSync(ENTRIES_FILE, 'utf8');
        const entries = JSON.parse(entriesData);
        const filteredEntries = entries.filter(entry => entry.id !== id);
        
        if (filteredEntries.length === entries.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Entry not found' }));
            return;
        }
        
        fs.writeFileSync(ENTRIES_FILE, JSON.stringify(filteredEntries, null, 2));
        
        console.log(`✓ Deleted entry with id: ${id}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Entry deleted successfully' }));
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete entry' }));
    }
}

server.listen(PORT, () => {
    console.log('===========================================');
    console.log('📔 Personal Journal & Diary running!');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📁 Data: ${ENTRIES_FILE}`);
    console.log('===========================================');
});
