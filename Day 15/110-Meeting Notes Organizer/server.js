const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4020;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    notes: [],
    projects: ['Engineering', 'Marketing', 'Product', 'General'],
    tags: ['meeting', 'brainstorm', 'planning', 'retrospective', '1-on-1']
  }, null, 2));
}

function readData() { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { notes: [], projects: [], tags: [] }; } }
function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }
function parseBody(req) { return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); }); }

const server = http.createServer(async (req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/notes' && req.method === 'GET') {
      const d = readData(); const project = url.searchParams.get('project'); const tag = url.searchParams.get('tag'); const search = url.searchParams.get('search')?.toLowerCase();
      let notes = d.notes;
      if (project) notes = notes.filter(n => n.project === project);
      if (tag) notes = notes.filter(n => n.tags?.includes(tag));
      if (search) notes = notes.filter(n => n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search) || n.tags?.some(t => t.toLowerCase().includes(search)));
      notes.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.writeHead(200, cors); res.end(JSON.stringify(notes));
    }
    else if (url.pathname === '/api/notes' && req.method === 'POST') {
      const b = await parseBody(req); const d = readData();
      const n = { id: Date.now().toString(), title: b.title, project: b.project, date: b.date || new Date().toISOString().split('T')[0], content: b.content || '', actionItems: b.actionItems || [], tags: b.tags || [], createdAt: new Date().toISOString() };
      d.notes.push(n); writeData(d); res.writeHead(201, cors); res.end(JSON.stringify(n));
    }
    else if (url.pathname.startsWith('/api/notes/') && req.method === 'GET') { const id = url.pathname.split('/').pop(); const d = readData(); const n = d.notes.find(x => x.id === id); if (n) { res.writeHead(200, cors); res.end(JSON.stringify(n)); } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); } }
    else if (url.pathname.startsWith('/api/notes/') && req.method === 'PUT') {
      const id = url.pathname.split('/').pop(); const b = await parseBody(req); const d = readData();
      const idx = d.notes.findIndex(x => x.id === id);
      if (idx !== -1) { d.notes[idx] = { ...d.notes[idx], ...b }; writeData(d); res.writeHead(200, cors); res.end(JSON.stringify(d.notes[idx])); }
      else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
    }
    else if (url.pathname.startsWith('/api/notes/') && req.method === 'DELETE') { const id = url.pathname.split('/').pop(); const d = readData(); d.notes = d.notes.filter(x => x.id !== id); writeData(d); res.writeHead(200, cors); res.end(JSON.stringify({ success: true })); }
    else if (url.pathname === '/api/projects' && req.method === 'GET') { const d = readData(); res.writeHead(200, cors); res.end(JSON.stringify(d.projects)); }
    else if (url.pathname === '/api/tags' && req.method === 'GET') { const d = readData(); res.writeHead(200, cors); res.end(JSON.stringify(d.tags)); }
    else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')); }
    else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (e) { res.writeHead(500, cors); res.end(JSON.stringify({ error: e.message })); }
});

server.listen(PORT, () => console.log(`Meeting Notes Organizer running at http://localhost:${PORT}`));
