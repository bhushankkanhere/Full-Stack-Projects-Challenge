const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3010;
const DATA_FILE = path.join(__dirname, 'workouts.json');
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

    if (pathname === '/api/workouts' || pathname === '/api/workouts/') {
        if (req.method === 'GET') {
            const workouts = readData();
            workouts.sort((a, b) => new Date(b.date + 'T' + (b.createdAt || '00:00:00')) - new Date(a.date + 'T' + (a.createdAt || '00:00:00')));
            sendJson(res, 200, workouts);
        } else if (req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { exerciseName, sets, reps, date } = body;

                if (!exerciseName || sets === undefined || reps === undefined || !date) {
                    return sendJson(res, 400, { error: 'Missing required fields: exerciseName, sets, reps, date' });
                }

                if (exerciseName.length < 2) {
                    return sendJson(res, 400, { error: 'Exercise name must be at least 2 characters' });
                }

                if (parseInt(sets) < 1 || parseInt(reps) < 1) {
                    return sendJson(res, 400, { error: 'Sets and reps must be at least 1' });
                }

                const workouts = readData();
                const newWorkout = {
                    id: generateId(),
                    exerciseName: exerciseName.trim(),
                    muscleGroup: (body.muscleGroup || '').trim(),
                    sets: parseInt(sets),
                    reps: parseInt(reps),
                    weight: parseFloat(body.weight) || 0,
                    date: date,
                    workoutNotes: (body.workoutNotes || '').trim(),
                    createdAt: new Date().toISOString()
                };

                workouts.push(newWorkout);
                writeData(workouts);
                sendJson(res, 201, newWorkout);
            } catch (error) {
                sendJson(res, 400, { error: 'Invalid request body' });
            }
        } else {
            sendJson(res, 405, { error: 'Method not allowed' });
        }
    } else if (pathname.startsWith('/api/workouts/')) {
        const workoutId = pathname.split('/api/workouts/')[1];

        if (req.method === 'GET') {
            const workouts = readData();
            const workout = workouts.find(w => w.id === workoutId);
            if (!workout) {
                return sendJson(res, 404, { error: 'Workout not found' });
            }
            sendJson(res, 200, workout);
        } else if (req.method === 'PUT') {
            try {
                const body = await parseBody(req);
                const workouts = readData();
                const index = workouts.findIndex(w => w.id === workoutId);

                if (index === -1) {
                    return sendJson(res, 404, { error: 'Workout not found' });
                }

                if (body.exerciseName && body.exerciseName.length < 2) {
                    return sendJson(res, 400, { error: 'Exercise name must be at least 2 characters' });
                }

                const sets = body.sets !== undefined ? parseInt(body.sets) : workouts[index].sets;
                const reps = body.reps !== undefined ? parseInt(body.reps) : workouts[index].reps;

                if (sets < 1 || reps < 1) {
                    return sendJson(res, 400, { error: 'Sets and reps must be at least 1' });
                }

                workouts[index] = {
                    ...workouts[index],
                    exerciseName: body.exerciseName !== undefined ? body.exerciseName.trim() : workouts[index].exerciseName,
                    muscleGroup: body.muscleGroup !== undefined ? body.muscleGroup.trim() : workouts[index].muscleGroup,
                    sets: sets,
                    reps: reps,
                    weight: body.weight !== undefined ? parseFloat(body.weight) : workouts[index].weight,
                    date: body.date || workouts[index].date,
                    workoutNotes: body.workoutNotes !== undefined ? body.workoutNotes.trim() : workouts[index].workoutNotes,
                    updatedAt: new Date().toISOString()
                };

                writeData(workouts);
                sendJson(res, 200, workouts[index]);
            } catch (error) {
                sendJson(res, 400, { error: 'Invalid request body' });
            }
        } else if (req.method === 'DELETE') {
            const workouts = readData();
            const index = workouts.findIndex(w => w.id === workoutId);

            if (index === -1) {
                return sendJson(res, 404, { error: 'Workout not found' });
            }

            const deleted = workouts.splice(index, 1);
            writeData(workouts);
            sendJson(res, 200, { message: 'Workout deleted', workout: deleted[0] });
        } else {
            sendJson(res, 405, { error: 'Method not allowed' });
        }
    } else {
        sendJson(res, 404, { error: 'Not found' });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Fitness Workout Logger server running on http://localhost:${PORT}`);
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
        console.log(`Created ${DATA_FILE}`);
    }
});
