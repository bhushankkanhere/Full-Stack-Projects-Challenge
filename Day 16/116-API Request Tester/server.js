const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 4016;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    collections: [{ id: '1', name: 'My Requests', requests: [] }]
  }, null, 2));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { collections: [] }; }
}

function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

function parseBody(req) {
  return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); });
}

function makeRequest(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const options = { hostname: parsed.hostname, port: parsed.port, path: parsed.pathname + parsed.search, method, headers: headers || {} };
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body: data, time: Date.now() });
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    } catch (e) { reject(e); }
  });
}

const server = http.createServer(async (req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/collections' && req.method === 'GET') { const d = readData(); res.writeHead(200, cors); res.end(JSON.stringify(d.collections)); }
    else if (url.pathname === '/api/collections' && req.method === 'POST') { const b = await parseBody(req); const d = readData(); const c = { id: Date.now().toString(), name: b.name, requests: [] }; d.collections.push(c); writeData(d); res.writeHead(201, cors); res.end(JSON.stringify(c)); }
    else if (url.pathname === '/api/requests' && req.method === 'POST') { const b = await parseBody(req); const d = readData(); const r = { id: Date.now().toString(), name: b.name, url: b.url, method: b.method || 'GET', headers: b.headers || {}, body: b.body || '', collectionId: b.collectionId }; d.collections.forEach(c => { if (c.id === b.collectionId) c.requests.push(r); }); writeData(d); res.writeHead(201, cors); res.end(JSON.stringify(r)); }
    else if (url.pathname === '/api/requests' && req.method === 'PUT') { const b = await parseBody(req); const d = readData(); d.collections.forEach(c => { const idx = c.requests.findIndex(r => r.id === b.id); if (idx !== -1) c.requests[idx] = { ...c.requests[idx], ...b }; }); writeData(d); res.writeHead(200, cors); res.end(JSON.stringify({ success: true })); }
    else if (url.pathname.startsWith('/api/requests/') && req.method === 'DELETE') { const id = url.pathname.split('/').pop(); const d = readData(); d.collections.forEach(c => { c.requests = c.requests.filter(r => r.id !== id); }); writeData(d); res.writeHead(200, cors); res.end(JSON.stringify({ success: true })); }
    else if (url.pathname === '/api/send' && req.method === 'POST') {
      const b = await parseBody(req);
      const startTime = Date.now();
      try {
        const result = await makeRequest(b.url, b.method || 'GET', b.headers || {}, b.body || null);
        result.duration = Date.now() - startTime;
        if (typeof result.body === 'string' && result.body.startsWith('{')) { try { result.body = JSON.parse(result.body); } catch {} }
        res.writeHead(200, cors); res.end(JSON.stringify(result));
      } catch (e) { res.writeHead(200, cors); res.end(JSON.stringify({ status: 0, error: e.message, duration: Date.now() - startTime })); }
    }
    else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')); }
    else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (e) { res.writeHead(500, cors); res.end(JSON.stringify({ error: e.message })); }
});

server.listen(PORT, () => console.log(`API Request Tester running at http://localhost:${PORT}`));
