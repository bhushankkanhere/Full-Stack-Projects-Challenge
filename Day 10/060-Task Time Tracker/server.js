const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4011;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    projects: [{ id: '1', name: 'Website Redesign', color: '#3b82f6' }],
    tasks: [], timeLogs: []
  }, null, 2));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { projects: [], tasks: [], timeLogs: [] }; }
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
    if (url.pathname === '/api/projects' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.projects));
    } else if (url.pathname === '/api/projects' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const proj = { id: Date.now().toString(), name: body.name, color: body.color || '#3b82f6' };
      data.projects.push(proj); writeData(data); res.writeHead(201, cors); res.end(JSON.stringify(proj));
    } else if (url.pathname === '/api/tasks' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.tasks));
    } else if (url.pathname === '/api/tasks' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const task = { id: Date.now().toString(), title: body.title, projectId: body.projectId, status: 'pending', createdAt: new Date().toISOString() };
      data.tasks.push(task); writeData(data); res.writeHead(201, cors); res.end(JSON.stringify(task));
    } else if (url.pathname.startsWith('/api/tasks/') && req.method === 'DELETE') {
      const id = url.pathname.split('/').pop(); const data = readData();
      data.tasks = data.tasks.filter(t => t.id !== id); data.timeLogs = data.timeLogs.filter(l => l.taskId !== id);
      writeData(data); res.writeHead(200, cors); res.end(JSON.stringify({ success: true }));
    } else if (url.pathname === '/api/time-logs' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.timeLogs));
    } else if (url.pathname === '/api/time-logs' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const log = { id: Date.now().toString(), taskId: body.taskId, startTime: body.startTime, endTime: body.endTime || null, duration: body.duration || 0 };
      data.timeLogs.push(log); writeData(data); res.writeHead(201, cors); res.end(JSON.stringify(log));
    } else if (url.pathname.startsWith('/api/time-logs/') && req.method === 'PUT') {
      const id = url.pathname.split('/').pop(); const body = await parseBody(req); const data = readData();
      const idx = data.timeLogs.findIndex(l => l.id === id);
      if (idx !== -1) {
        data.timeLogs[idx] = { ...data.timeLogs[idx], ...body };
        if (body.endTime && data.timeLogs[idx].startTime) {
          data.timeLogs[idx].duration = Math.round((new Date(body.endTime) - new Date(data.timeLogs[idx].startTime)) / 1000);
        }
        writeData(data); res.writeHead(200, cors); res.end(JSON.stringify(data.timeLogs[idx]));
      } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
    } else if (url.pathname === '/api/report' && req.method === 'GET') {
      const data = readData();
      const report = data.projects.map(p => {
        const projectTasks = data.tasks.filter(t => t.projectId === p.id);
        const taskIds = projectTasks.map(t => t.id);
        const logs = data.timeLogs.filter(l => taskIds.includes(l.taskId) && l.endTime);
        const totalSeconds = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
        return { ...p, totalSeconds, taskCount: projectTasks.length, logCount: logs.length };
      });
      res.writeHead(200, cors); res.end(JSON.stringify(report));
    } else if (url.pathname === '/api/export' && req.method === 'GET') {
      const data = readData();
      const csvLines = ['Task,Project,Start Time,End Time,Duration (minutes)'];
      data.timeLogs.filter(l => l.endTime).forEach(log => {
        const task = data.tasks.find(t => t.id === log.taskId);
        const project = data.projects.find(p => p.id === (task?.projectId));
        if (task && project) {
          const dur = ((log.duration || 0) / 60).toFixed(1);
          csvLines.push(`"${task.title}","${project.name}","${new Date(log.startTime).toLocaleString()}","${new Date(log.endTime).toLocaleString()}",${dur}`);
        }
      });
      res.writeHead(200, { ...cors, 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=time-report.csv' });
      res.end(csvLines.join('\n'));
    } else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
    } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (err) { res.writeHead(500, cors); res.end(JSON.stringify({ error: err.message })); }
});

server.listen(PORT, () => console.log(`Task Time Tracker running at http://localhost:${PORT}`));
