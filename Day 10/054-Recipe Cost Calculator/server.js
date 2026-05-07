const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4012;
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    recipes: [],
    categories: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks']
  }, null, 2));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { recipes: [], categories: [] }; }
}

function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function calcCost(ingredients, servings) {
  const total = ingredients.reduce((sum, i) => sum + (i.cost * (i.quantity || 1)), 0);
  return { total: total.toFixed(2), perServing: servings ? (total / servings).toFixed(2) : '0.00' };
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/recipes' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.recipes));
    } else if (url.pathname === '/api/recipes' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const recipe = { id: Date.now().toString(), name: body.name, category: body.category, ingredients: body.ingredients || [], servings: body.servings || 1, instructions: body.instructions || '', createdAt: new Date().toISOString() };
      const cost = calcCost(recipe.ingredients, recipe.servings);
      recipe.cost = cost;
      data.recipes.push(recipe); writeData(data); res.writeHead(201, cors); res.end(JSON.stringify(recipe));
    } else if (url.pathname.startsWith('/api/recipes/') && req.method === 'GET') {
      const id = url.pathname.split('/').pop(); const data = readData();
      const recipe = data.recipes.find(r => r.id === id);
      if (recipe) { res.writeHead(200, cors); res.end(JSON.stringify(recipe)); }
      else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
    } else if (url.pathname.startsWith('/api/recipes/') && req.method === 'PUT') {
      const id = url.pathname.split('/').pop(); const body = await parseBody(req); const data = readData();
      const idx = data.recipes.findIndex(r => r.id === id);
      if (idx !== -1) {
        data.recipes[idx] = { ...data.recipes[idx], ...body };
        const cost = calcCost(data.recipes[idx].ingredients, data.recipes[idx].servings);
        data.recipes[idx].cost = cost;
        writeData(data); res.writeHead(200, cors); res.end(JSON.stringify(data.recipes[idx]));
      } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
    } else if (url.pathname.startsWith('/api/recipes/') && req.method === 'DELETE') {
      const id = url.pathname.split('/').pop(); const data = readData();
      data.recipes = data.recipes.filter(r => r.id !== id); writeData(data); res.writeHead(200, cors); res.end(JSON.stringify({ success: true }));
    } else if (url.pathname === '/api/categories' && req.method === 'GET') {
      const data = readData(); res.writeHead(200, cors); res.end(JSON.stringify(data.categories));
    } else if (url.pathname === '/api/shopping-list' && req.method === 'POST') {
      const body = await parseBody(req); const data = readData();
      const selectedRecipes = data.recipes.filter(r => body.recipeIds.includes(r.id));
      const ingredients = {};
      selectedRecipes.forEach(r => r.ingredients.forEach(i => {
        const key = i.name.toLowerCase();
        if (ingredients[key]) ingredients[key].quantity += (i.quantity || 1);
        else ingredients[key] = { name: i.name, quantity: i.quantity || 1, unit: i.unit || '' };
      }));
      res.writeHead(200, cors); res.end(JSON.stringify(Object.values(ingredients)));
    } else if (url.pathname === '/api/calc-cost' && req.method === 'POST') {
      const body = await parseBody(req);
      const cost = calcCost(body.ingredients || [], body.servings || 1);
      res.writeHead(200, cors); res.end(JSON.stringify(cost));
    } else if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
    } else { res.writeHead(404, cors); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (err) { res.writeHead(500, cors); res.end(JSON.stringify({ error: err.message })); }
});

server.listen(PORT, () => console.log(`Recipe Cost Calculator running at http://localhost:${PORT}`));
