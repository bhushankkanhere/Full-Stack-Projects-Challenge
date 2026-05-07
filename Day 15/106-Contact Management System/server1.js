const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// Initialize contacts file if it doesn't exist
if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([]));
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
        serveFile(path.join(__dirname, 'Contact Management System', 'index.html'), 'text/html', res);
    } else if (pathname === '/style.css') {
        serveFile(path.join(__dirname, 'Contact Management System', 'style.css'), 'text/css', res);
    } else if (pathname === '/script.js') {
        serveFile(path.join(__dirname, 'Contact Management System', 'script.js'), 'application/javascript', res);
    }
    // API routes
    else if (pathname === '/api/contacts' && req.method === 'GET') {
        handleGetContacts(res);
    } else if (pathname === '/api/contacts' && req.method === 'POST') {
        handlePostContact(req, res);
    } else if (pathname.startsWith('/api/contacts/') && req.method === 'PUT') {
        const id = pathname.split('/')[3];
        handlePutContact(req, res, id);
    } else if (pathname.startsWith('/api/contacts/') && req.method === 'DELETE') {
        const id = pathname.split('/')[3];
        handleDeleteContact(res, id);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function handleGetContacts(res) {
    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(contacts));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read contacts' }));
    }
}

function handlePostContact(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
            const newContact = {
                id: Date.now().toString(),
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            contacts.push(newContact);
            fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newContact));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to add contact' }));
        }
    });
}

function handlePutContact(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
            const contactIndex = contacts.findIndex(contact => contact.id === id);
            if (contactIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Contact not found' }));
                return;
            }
            contacts[contactIndex] = {
                ...contacts[contactIndex],
                name: data.name || contacts[contactIndex].name,
                email: data.email || contacts[contactIndex].email,
                phone: data.phone || contacts[contactIndex].phone,
                address: data.address || contacts[contactIndex].address,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(contacts[contactIndex]));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to update contact' }));
        }
    });
}

function handleDeleteContact(res, id) {
    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        const filteredContacts = contacts.filter(contact => contact.id !== id);
        if (filteredContacts.length === contacts.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Contact not found' }));
            return;
        }
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(filteredContacts, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Contact deleted' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete contact' }));
    }
}

server.listen(PORT, () => {
    console.log(`Contact Management Server running at http://localhost:${PORT}`);
});
