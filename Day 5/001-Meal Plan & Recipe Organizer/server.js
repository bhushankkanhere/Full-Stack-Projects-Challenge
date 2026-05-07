const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3011;
const DATA_FILE = path.join(__dirname, 'recipes.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API routes
  if (pathname === '/api/recipes' && method === 'GET') {
    const recipes = readData();
    sendJSON(res, 200, recipes);
    return;
  }

  if (pathname === '/api/recipes' && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.ingredients || !body.steps) {
        sendJSON(res, 400, { error: 'Title, ingredients, and steps are required' });
        return;
      }
      const recipes = readData();
      const recipe = {
        id: Date.now().toString(),
        title: body.title,
        ingredients: body.ingredients,
        steps: body.steps,
        cookTime: body.cookTime || 0,
        servings: body.servings || 1,
        category: body.category || 'Other',
        rating: body.rating || 0,
        createdAt: new Date().toISOString()
      };
      recipes.push(recipe);
      writeData(recipes);
      sendJSON(res, 201, recipe);
    } catch (err) {
      sendJSON(res, 400, { error: err.message });
    }
    return;
  }

  const recipeMatch = pathname.match(/^\/api\/recipes\/(\w+)$/);
  if (recipeMatch && method === 'PUT') {
    try {
      const id = recipeMatch[1];
      const body = await parseBody(req);
      const recipes = readData();
      const idx = recipes.findIndex(r => r.id === id);
      if (idx === -1) {
        sendJSON(res, 404, { error: 'Recipe not found' });
        return;
      }
      recipes[idx] = { ...recipes[idx], ...body, id };
      writeData(recipes);
      sendJSON(res, 200, recipes[idx]);
    } catch (err) {
      sendJSON(res, 400, { error: err.message });
    }
    return;
  }

  if (recipeMatch && method === 'DELETE') {
    const id = recipeMatch[1];
    let recipes = readData();
    const idx = recipes.findIndex(r => r.id === id);
    if (idx === -1) {
      sendJSON(res, 404, { error: 'Recipe not found' });
      return;
    }
    recipes = recipes.filter(r => r.id !== id);
    writeData(recipes);
    sendJSON(res, 200, { message: 'Recipe deleted' });
    return;
  }

  // Weekly meal plan
  if (pathname === '/api/mealplan' && method === 'GET') {
    try {
      ensureDataFile();
      let plan = {};
      const planFile = path.join(__dirname, 'mealplan.json');
      if (fs.existsSync(planFile)) {
        plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
      }
      sendJSON(res, 200, plan);
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/mealplan' && method === 'PUT') {
    try {
      const body = await parseBody(req);
      const planFile = path.join(__dirname, 'mealplan.json');
      fs.writeFileSync(planFile, JSON.stringify(body, null, 2));
      sendJSON(res, 200, body);
    } catch (err) {
      sendJSON(res, 400, { error: err.message });
    }
    return;
  }

  // Static files
  const ext = path.extname(pathname);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  sendFile(res, filePath, contentType);
});

ensureDataFile();
server.listen(PORT, () => {
  console.log(`Meal Plan & Recipe Organizer server running on http://localhost:${PORT}`);
});
