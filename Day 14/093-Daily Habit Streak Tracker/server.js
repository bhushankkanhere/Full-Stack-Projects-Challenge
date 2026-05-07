const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3002;
const HABITS_FILE = path.join(__dirname, 'habits.json');

// Initialize habits file if it doesn't exist
if (!fs.existsSync(HABITS_FILE)) {
    fs.writeFileSync(HABITS_FILE, JSON.stringify([]));
    console.log('Created habits.json file');
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

    console.log(`${req.method} ${pathname}`);

    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
        serveFile(path.join(__dirname, 'index.html'), 'text/html', res);
    } else if (pathname === '/style.css') {
        serveFile(path.join(__dirname, 'style.css'), 'text/css', res);
    } else if (pathname === '/script.js') {
        serveFile(path.join(__dirname, 'script.js'), 'application/javascript', res);
    }
    // API routes
    else if (pathname === '/api/habits' && req.method === 'GET') {
        handleGetHabits(res);
    } else if (pathname === '/api/habits' && req.method === 'POST') {
        handlePostHabit(req, res);
    } else if (pathname.startsWith('/api/habits/') && pathname.endsWith('/complete') && req.method === 'POST') {
        const id = pathname.split('/')[3];
        handleCompleteHabit(req, res, id);
    } else if (pathname.startsWith('/api/habits/') && req.method === 'PUT') {
        const id = pathname.split('/')[3];
        handlePutHabit(req, res, id);
    } else if (pathname.startsWith('/api/habits/') && req.method === 'DELETE') {
        const id = pathname.split('/')[3];
        handleDeleteHabit(res, id);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error serving file:', filePath, err);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function handleGetHabits(res) {
    try {
        const data = fs.readFileSync(HABITS_FILE, 'utf8');
        
        // Handle empty file
        if (!data || data.trim().length === 0) {
            console.log('Habits file is empty, initializing with empty array');
            const emptyHabits = [];
            fs.writeFileSync(HABITS_FILE, JSON.stringify(emptyHabits, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(emptyHabits));
            return;
        }
        
        const habits = JSON.parse(data);
        
        // Validate that we got an array
        if (!Array.isArray(habits)) {
            console.error('Invalid habits format in file');
            const emptyHabits = [];
            fs.writeFileSync(HABITS_FILE, JSON.stringify(emptyHabits, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(emptyHabits));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(habits));
        console.log(`✓ Retrieved ${habits.length} habits`);
    } catch (error) {
        console.error('Error reading habits:', error);
        // Return empty array on error instead of failing
        const emptyHabits = [];
        try {
            fs.writeFileSync(HABITS_FILE, JSON.stringify(emptyHabits, null, 2));
        } catch (writeError) {
            console.error('Failed to reset habits file:', writeError);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(emptyHabits));
    }
}

function handlePostHabit(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            console.log('Received habit data:', body);
            const data = JSON.parse(body);
            
            if (!data.name || data.name.trim().length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Habit name is required' }));
                return;
            }

            const habitsData = fs.readFileSync(HABITS_FILE, 'utf8');
            const habits = JSON.parse(habitsData);
            
            const newHabit = {
                id: Date.now().toString(),
                name: data.name.trim(),
                category: data.category || 'other',
                description: data.description || '',
                target: data.target || 1,
                reminder: data.reminder || '',
                streak: 0,
                longestStreak: 0,
                currentProgress: 0,
                completedDates: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            habits.push(newHabit);
            fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2));
            
            console.log(`✓ Created habit: ${newHabit.name}`);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newHabit));
        } catch (error) {
            console.error('Error adding habit:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to add habit: ' + error.message }));
        }
    });
    
    req.on('error', (err) => {
        console.error('Request error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request failed' }));
    });
}

function handlePutHabit(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const habitsData = fs.readFileSync(HABITS_FILE, 'utf8');
            const habits = JSON.parse(habitsData);
            
            const habitIndex = habits.findIndex(habit => habit.id === id);
            if (habitIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Habit not found' }));
                return;
            }

            // Update habit fields
            if (data.name) habits[habitIndex].name = data.name.trim();
            if (data.category) habits[habitIndex].category = data.category;
            if (data.description !== undefined) habits[habitIndex].description = data.description;
            if (data.target) habits[habitIndex].target = data.target;
            if (data.reminder !== undefined) habits[habitIndex].reminder = data.reminder;
            habits[habitIndex].updatedAt = new Date().toISOString();

            fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2));
            
            console.log(`✓ Updated habit: ${habits[habitIndex].name}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(habits[habitIndex]));
        } catch (error) {
            console.error('Error updating habit:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to update habit' }));
        }
    });
}

function handleDeleteHabit(res, id) {
    try {
        const habitsData = fs.readFileSync(HABITS_FILE, 'utf8');
        const habits = JSON.parse(habitsData);
        const filteredHabits = habits.filter(habit => habit.id !== id);
        
        if (filteredHabits.length === habits.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Habit not found' }));
            return;
        }

        fs.writeFileSync(HABITS_FILE, JSON.stringify(filteredHabits, null, 2));
        
        console.log(`✓ Deleted habit with id: ${id}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Habit deleted successfully' }));
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete habit' }));
    }
}

function handleCompleteHabit(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const habitsData = fs.readFileSync(HABITS_FILE, 'utf8');
            const habits = JSON.parse(habitsData);
            
            const habitIndex = habits.findIndex(habit => habit.id === id);
            if (habitIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Habit not found' }));
                return;
            }

            const habit = habits[habitIndex];
            const today = data.today;
            
            // Initialize completedDates if it doesn't exist
            if (!habit.completedDates) {
                habit.completedDates = [];
            }

            // Check if already completed today
            if (habit.completedDates.includes(today)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Habit already completed today' }));
                return;
            }

            // Add today to completed dates
            habit.completedDates.push(today);
            habit.currentProgress = data.currentProgress || 1;

            // Calculate streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // If completed yesterday or first time, increment streak
            if (habit.completedDates.includes(yesterdayStr) || habit.completedDates.length === 1) {
                habit.streak = (habit.streak || 0) + 1;
            } else {
                // Check if there's a gap, reset streak
                habit.streak = 1;
            }

            // Update longest streak
            if (habit.streak > (habit.longestStreak || 0)) {
                habit.longestStreak = habit.streak;
            }

            // Reset progress if target reached
            if (habit.currentProgress >= (habit.target || 1)) {
                habit.currentProgress = 0;
            }

            habit.updatedAt = new Date().toISOString();

            fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2));
            
            console.log(`✓ Habit completed: ${habit.name}, Streak: ${habit.streak}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Habit completed successfully',
                streak: habit.streak,
                longestStreak: habit.longestStreak
            }));
        } catch (error) {
            console.error('Error completing habit:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to complete habit' }));
        }
    });
}

server.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🔥 Habit Streak Tracker running!`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📁 Data: ${HABITS_FILE}`);
    console.log(`===========================================`);
});
