const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Initialize tasks file if it doesn't exist
if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
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
    else if (pathname === '/api/tasks' && req.method === 'GET') {
        handleGetTasks(res);
    } else if (pathname === '/api/tasks' && req.method === 'POST') {
        handlePostTask(req, res);
    } else if (pathname.startsWith('/api/tasks/') && (req.method === 'PUT' || req.method === 'DELETE')) {
        const id = pathname.split('/')[3];
        if (req.method === 'PUT') {
            handlePutTask(req, res, id);
        } else {
            handleDeleteTask(res, id);
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

function handleGetTasks(res) {
    try {
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tasks));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read tasks' }));
    }
}

function handlePostTask(req, res) {
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
                res.end(JSON.stringify({ error: 'Task title is required' }));
                return;
            }

            if (data.title.length > 150) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Title must be less than 150 characters' }));
                return;
            }

            const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
            
            const newTask = {
                id: Date.now().toString(),
                title: data.title.trim(),
                description: data.description ? data.description.trim().substring(0, 1000) : '',
                category: data.category || 'Personal',
                priority: data.priority || 'Medium',
                completed: false,
                dueDate: data.dueDate || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newTask));
        } catch (error) {
            console.error('Error creating task:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to create task' }));
        }
    });
}

function handlePutTask(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
            
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Task not found' }));
                return;
            }

            // Validate title if provided
            if (data.title !== undefined) {
                if (data.title.trim().length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Task title cannot be empty' }));
                    return;
                }
                if (data.title.length > 150) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Title must be less than 150 characters' }));
                    return;
                }
            }

            // Update task fields
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: data.title !== undefined ? data.title.trim() : tasks[taskIndex].title,
                description: data.description !== undefined ? data.description.trim().substring(0, 1000) : tasks[taskIndex].description,
                category: data.category !== undefined ? data.category : tasks[taskIndex].category,
                priority: data.priority !== undefined ? data.priority : tasks[taskIndex].priority,
                completed: data.completed !== undefined ? data.completed : tasks[taskIndex].completed,
                dueDate: data.dueDate !== undefined ? data.dueDate : tasks[taskIndex].dueDate,
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks[taskIndex]));
        } catch (error) {
            console.error('Error updating task:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to update task' }));
        }
    });
}

function handleDeleteTask(res, id) {
    try {
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
        const filteredTasks = tasks.filter(task => task.id !== id);
        
        if (filteredTasks.length === tasks.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Task not found' }));
            return;
        }
        
        fs.writeFileSync(TASKS_FILE, JSON.stringify(filteredTasks, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task deleted successfully' }));
    } catch (error) {
        console.error('Error deleting task:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete task' }));
    }
}

server.listen(PORT, () => {
    console.log(`Task Manager Server running at http://localhost:${PORT}`);
});
