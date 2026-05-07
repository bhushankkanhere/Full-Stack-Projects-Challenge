const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3008;
const DATA_FILE = path.join(__dirname, 'events.json');
const HOST = '0.0.0.0';

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error.message);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data file:', error.message);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/api/events' || pathname === '/api/events/') {
        if (req.method === 'GET') {
            const events = readData();
            events.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            sendJson(res, 200, events);
        } else if (req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { title, date, time, category } = body;

                if (!title || !date || !time || !category) {
                    return sendJson(res, 400, { error: 'Missing required fields: title, date, time, category' });
                }

                if (title.length < 2) {
                    return sendJson(res, 400, { error: 'Title must be at least 2 characters' });
                }

                const events = readData();
                const newEvent = {
                    id: generateId(),
                    title: body.title.trim(),
                    description: (body.description || '').trim(),
                    date,
                    time,
                    endDate: body.endDate || date,
                    endTime: body.endTime || '',
                    category,
                    location: (body.location || '').trim(),
                    createdAt: new Date().toISOString()
                };

                events.push(newEvent);
                writeData(events);
                sendJson(res, 201, newEvent);
            } catch (error) {
                sendJson(res, 400, { error: 'Invalid request body' });
            }
        } else {
            sendJson(res, 405, { error: 'Method not allowed' });
        }
    } else if (pathname.startsWith('/api/events/')) {
        const eventId = pathname.split('/api/events/')[1];

        if (req.method === 'GET') {
            const events = readData();
            const event = events.find(e => e.id === eventId);
            if (!event) {
                return sendJson(res, 404, { error: 'Event not found' });
            }
            sendJson(res, 200, event);
        } else if (req.method === 'PUT') {
            try {
                const body = await parseBody(req);
                const events = readData();
                const index = events.findIndex(e => e.id === eventId);

                if (index === -1) {
                    return sendJson(res, 404, { error: 'Event not found' });
                }

                if (body.title && body.title.length < 2) {
                    return sendJson(res, 400, { error: 'Title must be at least 2 characters' });
                }

                events[index] = {
                    ...events[index],
                    title: body.title !== undefined ? body.title.trim() : events[index].title,
                    description: body.description !== undefined ? body.description.trim() : events[index].description,
                    date: body.date || events[index].date,
                    time: body.time || events[index].time,
                    endDate: body.endDate || events[index].endDate,
                    endTime: body.endTime !== undefined ? body.endTime : events[index].endTime,
                    category: body.category || events[index].category,
                    location: body.location !== undefined ? body.location.trim() : events[index].location,
                    updatedAt: new Date().toISOString()
                };

                writeData(events);
                sendJson(res, 200, events[index]);
            } catch (error) {
                sendJson(res, 400, { error: 'Invalid request body' });
            }
        } else if (req.method === 'DELETE') {
            const events = readData();
            const index = events.findIndex(e => e.id === eventId);

            if (index === -1) {
                return sendJson(res, 404, { error: 'Event not found' });
            }

            const deleted = events.splice(index, 1);
            writeData(events);
            sendJson(res, 200, { message: 'Event deleted', event: deleted[0] });
        } else {
            sendJson(res, 405, { error: 'Method not allowed' });
        }
    } else {
        sendJson(res, 404, { error: 'Not found' });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Event & Appointment Scheduler server running on http://localhost:${PORT}`);
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
        console.log(`Created ${DATA_FILE}`);
    }
});
