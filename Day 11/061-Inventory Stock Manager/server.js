const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3013;
const DATA_FILE = path.join(__dirname, 'inventory.json');

const MIME_TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

function readData() {
  ensureDataFile();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => { if (err) { res.writeHead(404); res.end('Not Found'); return; } res.writeHead(200, { 'Content-Type': contentType }); res.end(content); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }

  if (pathname === '/api/inventory' && method === 'GET') { sendJSON(res, 200, readData()); return; }

  if (pathname === '/api/inventory' && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.sku) { sendJSON(res, 400, { error: 'Name and SKU are required' }); return; }
      const items = readData();
      if (items.find(i => i.sku === body.sku)) { sendJSON(res, 400, { error: 'SKU already exists' }); return; }
      const item = { id: Date.now().toString(), name: body.name, sku: body.sku, category: body.category || 'General', quantity: body.quantity || 0, price: body.price || 0, lowStockThreshold: body.lowStockThreshold || 10, createdAt: new Date().toISOString() };
      items.push(item);
      writeData(items);
      sendJSON(res, 201, item);
    } catch (err) { sendJSON(res, 400, { error: err.message }); }
    return;
  }

  const match = pathname.match(/^\/api\/inventory\/(\w+)$/);
  if (match && method === 'PUT') {
    try {
      const id = match[1];
      const body = await parseBody(req);
      const items = readData();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) { sendJSON(res, 404, { error: 'Item not found' }); return; }
      const dupSku = items.find(i => i.sku === body.sku && i.id !== id);
      if (dupSku) { sendJSON(res, 400, { error: 'SKU already exists' }); return; }
      items[idx] = { ...items[idx], ...body, id };
      writeData(items);
      sendJSON(res, 200, items[idx]);
    } catch (err) { sendJSON(res, 400, { error: err.message }); }
    return;
  }

  if (match && method === 'DELETE') {
    const id = match[1];
    let items = readData();
    if (!items.find(i => i.id === id)) { sendJSON(res, 404, { error: 'Item not found' }); return; }
    items = items.filter(i => i.id !== id);
    writeData(items);
    sendJSON(res, 200, { message: 'Item deleted' });
    return;
  }

  const ext = path.extname(pathname);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  sendFile(res, path.join(__dirname, pathname === '/' ? 'index.html' : pathname), contentType);
});

ensureDataFile();
server.listen(PORT, () => { console.log(`Inventory Stock Manager server running on http://localhost:${PORT}`); });
