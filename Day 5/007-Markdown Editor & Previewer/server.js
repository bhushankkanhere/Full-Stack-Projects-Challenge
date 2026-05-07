const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4009;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ documents: [] }, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { documents: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === '/api/documents' && req.method === 'GET') {
      const data = readData();
      res.writeHead(200, cors);
      res.end(JSON.stringify(data.documents));
    } else if (url.pathname === '/api/documents' && req.method === 'POST') {
      const body = await parseBody(req);
      const data = readData();
      const doc = {
        id: Date.now().toString(),
        title: body.title || 'Untitled',
        content: body.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.documents.push(doc);
      writeData(data);
      res.writeHead(201, cors);
      res.end(JSON.stringify(doc));
    } else if (url.pathname.startsWith('/api/documents/') && req.method === 'GET') {
      const id = url.pathname.split('/').pop();
      const data = readData();
      const doc = data.documents.find(d => d.id === id);
      if (doc) {
        res.writeHead(200, cors);
        res.end(JSON.stringify(doc));
      } else {
        res.writeHead(404, cors);
        res.end(JSON.stringify({ error: 'Document not found' }));
      }
    } else if (url.pathname.startsWith('/api/documents/') && req.method === 'PUT') {
      const id = url.pathname.split('/').pop();
      const body = await parseBody(req);
      const data = readData();
      const idx = data.documents.findIndex(d => d.id === id);
      if (idx !== -1) {
        data.documents[idx] = { ...data.documents[idx], ...body, updatedAt: new Date().toISOString() };
        writeData(data);
        res.writeHead(200, cors);
        res.end(JSON.stringify(data.documents[idx]));
      } else {
        res.writeHead(404, cors);
        res.end(JSON.stringify({ error: 'Document not found' }));
      }
    } else if (url.pathname.startsWith('/api/documents/') && req.method === 'DELETE') {
      const id = url.pathname.split('/').pop();
      const data = readData();
      data.documents = data.documents.filter(d => d.id !== id);
      writeData(data);
      res.writeHead(200, cors);
      res.end(JSON.stringify({ success: true }));
    } else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404, cors);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (err) {
    res.writeHead(500, cors);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Markdown Editor & Previewer running at http://localhost:${PORT}`);
});
