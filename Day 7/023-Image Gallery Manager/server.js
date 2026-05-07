const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4010;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ images: [], albums: ['Nature', 'Architecture', 'Abstract'] }, null, 2));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { images: [], albums: [] }; }
}

function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/images' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.images));
    } else if (url.pathname === '/api/images' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const img = { id: Date.now().toString(), url: body.url, title: body.title || 'Untitled', album: body.album || '', tags: body.tags || [], createdAt: new Date().toISOString() };
      data.images.push(img); writeData(data); res.writeHead(201, cors); res.end(JSON.stringify(img));
    } else if (url.pathname.startsWith('/api/images/') && req.method === 'DELETE') {
      const id = url.pathname.split('/').pop(); const data = readData();
      data.images = data.images.filter(i => i.id !== id); writeData(data); res.writeHead(200, cors); res.end(JSON.stringify({ success: true }));
    } else if (url.pathname === '/api/albums' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.albums));
    } else if (url.pathname === '/api/albums' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      if (!data.albums.includes(body.name)) { data.albums.push(body.name); writeData(data); }
      res.writeHead(201, cors); res.end(JSON.stringify({ albums: data.albums }));
    } else if (url.pathname === '/api/search' && req.method === 'GET') {
      const q = url.searchParams.get('q')?.toLowerCase() || ''; const data = readData();
      const results = data.images.filter(i => i.title.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)) || i.album.toLowerCase().includes(q));
      res.writeHead(200, cors); res.end(JSON.stringify(results));
    } else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
    } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (err) { res.writeHead(500, cors); res.end(JSON.stringify({ error: err.message })); }
});

server.listen(PORT, () => console.log(`Image Gallery Manager running at http://localhost:${PORT}`));
