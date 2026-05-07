const API = 'http://localhost:3011/api';
let recipes = [];
let mealPlan = {};
let currentMealSlot = null;
let currentRating = 0;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

// DOM elements
const recipeList = document.getElementById('recipeList');
const searchInput = document.getElementById('searchRecipes');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const recipeModal = document.getElementById('recipeModal');
const recipeForm = document.getElementById('recipeForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const mealModal = document.getElementById('mealModal');
const closeMealModal = document.getElementById('closeMealModal');
const mealPlanner = document.getElementById('mealPlanner');
const mealRecipeList = document.getElementById('mealRecipeList');
const shoppingList = document.getElementById('shoppingList');
const toastContainer = document.getElementById('toastContainer');
const stars = document.querySelectorAll('.star');

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Fetch recipes
async function fetchRecipes() {
  try {
    const res = await fetch(`${API}/recipes`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    recipes = await res.json();
    renderRecipes();
  } catch (err) {
    showToast('Error loading recipes', 'error');
    console.error(err);
  }
}

// Render recipe cards
function renderRecipes() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sort = sortBy.value;

  let filtered = recipes.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search) ||
      r.ingredients.some(i => i.toLowerCase().includes(search));
    const matchCategory = !category || r.category === category;
    return matchSearch && matchCategory;
  });

  if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'cookTime') filtered.sort((a, b) => (a.cookTime || 0) - (b.cookTime || 0));
  else if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));

  if (filtered.length === 0) {
    recipeList.innerHTML = '<p class="empty-state">No recipes found. Add your first recipe!</p>';
    return;
  }

  recipeList.innerHTML = filtered.map(r => `
    <div class="recipe-card" data-id="${r.id}">
      <div class="recipe-card-header">
        <div>
          <h3>${escapeHtml(r.title)}</h3>
          <span class="recipe-category">${escapeHtml(r.category)}</span>
        </div>
      </div>
      <div class="recipe-meta">
        <span>${r.cookTime} min</span>
        <span>Serves ${r.servings}</span>
      </div>
      <div class="recipe-stars">${renderStars(r.rating || 0)}</div>
      <p class="recipe-ingredients">${escapeHtml(r.ingredients.slice(0, 4).join(', '))}${r.ingredients.length > 4 ? '...' : ''}</p>
      <div class="recipe-actions">
        <button class="btn btn-secondary btn-sm" onclick="editRecipe('${r.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${r.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= rating ? '' : 'empty'}">&#9733;</span>`;
  }
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Open modal
function openRecipeModal(edit = false) {
  recipeModal.classList.add('active');
  document.getElementById('modalTitle').textContent = edit ? 'Edit Recipe' : 'Add Recipe';
  if (!edit) {
    recipeForm.reset();
    document.getElementById('recipeId').value = '';
    currentRating = 0;
    updateStarDisplay();
  }
}

function closeRecipeModal() {
  recipeModal.classList.remove('active');
  recipeForm.reset();
  document.getElementById('recipeId').value = '';
  currentRating = 0;
  updateStarDisplay();
}

addRecipeBtn.addEventListener('click', () => openRecipeModal(false));
closeModal.addEventListener('click', closeRecipeModal);
cancelBtn.addEventListener('click', closeRecipeModal);

// Star rating
stars.forEach(star => {
  star.addEventListener('click', () => {
    currentRating = parseInt(star.dataset.value);
    document.getElementById('recipeRating').value = currentRating;
    updateStarDisplay();
  });
  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.value);
    stars.forEach((s, i) => s.classList.toggle('active', i < val));
  });
});

stars.forEach(() => {});
recipeForm.querySelector('.star-rating').addEventListener('mouseleave', updateStarDisplay);

function updateStarDisplay() {
  stars.forEach((s, i) => s.classList.toggle('active', i < currentRating));
}

// Save recipe
recipeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('recipeId').value;
  const title = document.getElementById('recipeTitle').value.trim();
  const cookTime = parseInt(document.getElementById('recipeCookTime').value) || 0;
  const servings = parseInt(document.getElementById('recipeServings').value) || 1;
  const category = document.getElementById('recipeCategory').value;
  const ingredients = document.getElementById('recipeIngredients').value.split('\n').map(s => s.trim()).filter(Boolean);
  const steps = document.getElementById('recipeSteps').value.split('\n').map(s => s.trim()).filter(Boolean);
  const rating = currentRating;

  if (!title || title.length < 2) { showToast('Title must be at least 2 characters', 'error'); return; }
  if (ingredients.length === 0) { showToast('Add at least one ingredient', 'error'); return; }
  if (steps.length === 0) { showToast('Add at least one step', 'error'); return; }

  const data = { title, ingredients, steps, cookTime, servings, category, rating };

  try {
    const url = id ? `${API}/recipes/${id}` : `${API}/recipes`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
    showToast(id ? 'Recipe updated!' : 'Recipe added!');
    closeRecipeModal();
    fetchRecipes();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Edit recipe
window.editRecipe = function(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  document.getElementById('recipeId').value = recipe.id;
  document.getElementById('recipeTitle').value = recipe.title;
  document.getElementById('recipeCookTime').value = recipe.cookTime;
  document.getElementById('recipeServings').value = recipe.servings;
  document.getElementById('recipeCategory').value = recipe.category;
  document.getElementById('recipeIngredients').value = recipe.ingredients.join('\n');
  document.getElementById('recipeSteps').value = recipe.steps.join('\n');
  currentRating = recipe.rating || 0;
  document.getElementById('recipeRating').value = currentRating;
  updateStarDisplay();
  openRecipeModal(true);
};

// Delete recipe
window.deleteRecipe = async function(id) {
  if (!confirm('Delete this recipe?')) return;
  try {
    const res = await fetch(`${API}/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Recipe deleted');
    fetchRecipes();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Search and filter
searchInput.addEventListener('input', renderRecipes);
categoryFilter.addEventListener('change', renderRecipes);
sortBy.addEventListener('change', renderRecipes);

// MEAL PLANNER
function renderMealPlanner() {
  mealPlanner.innerHTML = DAYS.map(day => `
    <div class="day-column">
      <h3>${day.substring(0, 3)}</h3>
      ${MEALS.map(meal => {
        const key = `${day}-${meal}`;
        const recipeId = mealPlan[key];
        const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
        return `
          <div class="meal-slot ${recipe ? 'filled' : ''}" data-day="${day}" data-meal="${meal}">
            <div class="meal-slot-label">${meal}</div>
            ${recipe
              ? `<div class="meal-slot-content" onclick="openMealModal('${day}', '${meal}')">${escapeHtml(recipe.title)}</div>`
              : `<div class="meal-slot-empty" onclick="openMealModal('${day}', '${meal}')">+ Add</div>`
            }
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}

window.openMealModal = function(day, meal) {
  currentMealSlot = { day, meal };
  document.getElementById('mealSlotTitle').textContent = `${day} - ${meal}`;
  mealRecipeList.innerHTML = recipes.length === 0
    ? '<p class="empty-state">No recipes yet. Add some recipes first!</p>'
    : recipes.map(r => `
        <div class="meal-recipe-item" onclick="selectMealRecipe('${r.id}')">
          <strong>${escapeHtml(r.title)}</strong>
          <div style="font-size:0.8rem;color:var(--text-muted)">${r.category} | ${r.cookTime} min</div>
        </div>
      `).join('');
  mealModal.classList.add('active');
};

window.selectMealRecipe = function(id) {
  if (currentMealSlot) {
    mealPlan[`${currentMealSlot.day}-${currentMealSlot.meal}`] = id;
    mealModal.classList.remove('active');
    renderMealPlanner();
    showToast(`${currentMealSlot.meal} planned for ${currentMealSlot.day}`);
  }
};

closeMealModal.addEventListener('click', () => mealModal.classList.remove('active'));

document.getElementById('savePlanBtn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/mealplan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealPlan)
    });
    if (!res.ok) throw new Error('Save failed');
    showToast('Meal plan saved!');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// SHOPPING LIST
document.getElementById('generateShoppingBtn').addEventListener('click', () => {
  const ingredients = {};
  Object.entries(mealPlan).forEach(([key, recipeId]) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const clean = ing.toLowerCase().trim();
        ingredients[clean] = (ingredients[clean] || 0) + 1;
      });
    }
  });

  if (Object.keys(ingredients).length === 0) {
    shoppingList.innerHTML = '<p class="empty-state">No ingredients in your meal plan. Add meals to the planner first!</p>';
    return;
  }

  const sorted = Object.keys(ingredients).sort();
  shoppingList.innerHTML = sorted.map((ing, i) => `
    <div class="shopping-item">
      <input type="checkbox" id="shop-${i}" onchange="this.parentElement.classList.toggle('checked', this.checked)">
      <label for="shop-${i}">${escapeHtml(ing)}</label>
    </div>
  `).join('');
  showToast('Shopping list generated!');
});

async function fetchMealPlan() {
  try {
    const res = await fetch(`${API}/mealplan`);
    if (!res.ok) throw new Error('Failed');
    mealPlan = await res.json();
    renderMealPlanner();
  } catch (err) {
    mealPlan = {};
    renderMealPlanner();
  }
}

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    openRecipeModal(false);
  }
  if (e.key === 'Escape') {
    recipeModal.classList.remove('active');
    mealModal.classList.remove('active');
  }
});

// Close modals on backdrop click
recipeModal.addEventListener('click', (e) => { if (e.target === recipeModal) closeRecipeModal(); });
mealModal.addEventListener('click', (e) => { if (e.target === mealModal) mealModal.classList.remove('active'); });

// INIT
fetchRecipes();
fetchMealPlan();
