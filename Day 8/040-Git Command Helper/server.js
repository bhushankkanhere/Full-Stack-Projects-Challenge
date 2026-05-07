const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4018;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ history: [], saved: [] }, null, 2));
}

function readData() { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { history: [], saved: [] }; } }
function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }
function parseBody(req) { return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); }); }

const workflows = {
  'New branch': (params) => `git checkout -b ${params.branch || 'feature-branch'}`,
  'Switch branch': (params) => `git checkout ${params.branch || 'main'}`,
  'Delete branch': (params) => `git branch -d ${params.branch || 'feature-branch'}`,
  'Merge branch': (params) => `git merge ${params.branch || 'feature-branch'}`,
  'Rebase': (params) => `git rebase ${params.branch || 'main'}`,
  'Stash changes': () => 'git stash',
  'Apply stash': () => 'git stash pop',
  'Reset soft': (params) => `git reset --soft ${params.commit || 'HEAD~1'}`,
  'Reset hard': (params) => `git reset --hard ${params.commit || 'HEAD~1'}`,
  'Cherry-pick': (params) => `git cherry-pick ${params.commit || 'abc1234'}`,
  'Tag': (params) => `git tag -a ${params.tag || 'v1.0.0'} -m "${params.message || 'Release v1.0.0'}"`,
  'Remote add': (params) => `git remote add origin ${params.url || 'git@github.com:user/repo.git'}`,
  'Push': (params) => `git push ${params.remote || 'origin'} ${params.branch || 'main'}`,
  'Pull': (params) => `git pull ${params.remote || 'origin'} ${params.branch || 'main'}`,
  'Fetch': (params) => `git fetch ${params.remote || 'origin'}`,
  'Clone': (params) => `git clone ${params.url || 'git@github.com:user/repo.git'}`,
  'Commit': (params) => `git commit -m "${params.message || 'commit message'}"`,
  'Amend commit': (params) => `git commit --amend -m "${params.message || 'updated message'}"`,
  'Revert commit': (params) => `git revert ${params.commit || 'HEAD'}`,
  'View log': (params) => `git log --oneline --graph --${params.count || 'all'}`,
  'Diff': (params) => `git diff ${params.from || 'HEAD~1'} ${params.to || 'HEAD'}`,
  'Blame': (params) => `git blame ${params.file || 'file.txt'}`,
};

const server = http.createServer(async (req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/workflows' && req.method === 'GET') { res.writeHead(200, cors); res.end(JSON.stringify(Object.keys(workflows))); }
    if (url.pathname === '/api/generate' && req.method === 'POST') {
      const b = await parseBody(req);
      const fn = workflows[b.workflow];
      const cmd = fn ? fn(b.params || {}) : 'Unknown workflow';
      const d = readData();
      d.history.unshift({ id: Date.now().toString(), workflow: b.workflow, command: cmd, createdAt: new Date().toISOString() });
      if (d.history.length > 100) d.history = d.history.slice(0, 100);
      writeData(d);
      res.writeHead(200, cors); res.end(JSON.stringify({ command: cmd }));
    }
    else if (url.pathname === '/api/history' && req.method === 'GET') { const d = readData(); res.writeHead(200, cors); res.end(JSON.stringify(d.history)); }
    else if (url.pathname === '/api/history' && req.method === 'DELETE') { const d = readData(); d.history = []; writeData(d); res.writeHead(200, cors); res.end(JSON.stringify({ success: true })); }
    else if (url.pathname === '/api/saved' && req.method === 'GET') { const d = readData(); res.writeHead(200, cors); res.end(JSON.stringify(d.saved)); }
    else if (url.pathname === '/api/saved' && req.method === 'POST') { const b = await parseBody(req); const d = readData(); d.saved.push({ id: Date.now().toString(), ...b }); writeData(d); res.writeHead(201, cors); res.end(JSON.stringify({ success: true })); }
    else if (url.pathname.startsWith('/api/saved/') && req.method === 'DELETE') { const id = url.pathname.split('/').pop(); const d = readData(); d.saved = d.saved.filter(s => s.id !== id); writeData(d); res.writeHead(200, cors); res.end(JSON.stringify({ success: true })); }
    else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')); }
    else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (e) { res.writeHead(500, cors); res.end(JSON.stringify({ error: e.message })); }
});

server.listen(PORT, () => console.log(`Git Command Helper running at http://localhost:${PORT}`));
