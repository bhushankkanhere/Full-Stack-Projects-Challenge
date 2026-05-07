const API = 'http://localhost:3013/api';
let inventory = [];

const toastContainer = document.getElementById('toastContainer');
const itemList = document.getElementById('itemList');
const searchInput = document.getElementById('searchInventory');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const itemForm = document.getElementById('itemForm');
const inventoryStats = document.getElementById('inventoryStats');
const alertList = document.getElementById('alertList');
const summaryGrid = document.getElementById('summaryGrid');

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'alerts') renderAlerts();
    if (btn.dataset.tab === 'summary') renderSummary();
  });
});

async function fetchInventory() {
  try {
    const res = await fetch(`${API}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch');
    inventory = await res.json();
    renderInventory();
    renderInventoryStats();
  } catch (err) { showToast('Error loading inventory', 'error'); }
}

function renderInventoryStats() {
  const total = inventory.length;
  const totalQty = inventory.reduce((s, i) => s + i.quantity, 0);
  const totalValue = inventory.reduce((s, i) => s + (i.quantity * i.price), 0);
  const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= (i.lowStockThreshold || 10)).length;
  const outOfStock = inventory.filter(i => i.quantity === 0).length;

  inventoryStats.innerHTML = `
    <div class="inv-stat"><div class="stat-num">${total}</div><div class="stat-label">Products</div></div>
    <div class="inv-stat"><div class="stat-num">${totalQty}</div><div class="stat-label">Total Units</div></div>
    <div class="inv-stat"><div class="stat-num">$${totalValue.toFixed(2)}</div><div class="stat-label">Total Value</div></div>
    <div class="inv-stat"><div class="stat-num" style="color:${lowStock > 0 ? 'var(--warning)' : 'var(--success)'}">${lowStock}</div><div class="stat-label">Low Stock</div></div>
    <div class="inv-stat"><div class="stat-num" style="color:${outOfStock > 0 ? 'var(--danger)' : 'var(--success)'}">${outOfStock}</div><div class="stat-label">Out of Stock</div></div>
  `;
}

function renderInventory() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const stock = stockFilter.value;

  let filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search) || item.sku.toLowerCase().includes(search);
    const matchCategory = !category || item.category === category;
    const threshold = item.lowStockThreshold || 10;
    let matchStock = true;
    if (stock === 'low') matchStock = item.quantity > 0 && item.quantity <= threshold;
    else if (stock === 'out') matchStock = item.quantity === 0;
    else if (stock === 'ok') matchStock = item.quantity > threshold;
    return matchSearch && matchCategory && matchStock;
  });

  if (filtered.length === 0) {
    itemList.innerHTML = '<p class="empty-state">No items found. Add your first inventory item!</p>';
    return;
  }

  itemList.innerHTML = filtered.map(item => {
    const threshold = item.lowStockThreshold || 10;
    const stockLevel = threshold > 0 ? Math.min((item.quantity / threshold) * 100, 100) : (item.quantity > 0 ? 100 : 0);
    const stockClass = item.quantity === 0 ? 'stock-out' : item.quantity <= threshold ? 'stock-low' : 'stock-ok';
    const cardClass = item.quantity === 0 ? 'out-of-stock' : item.quantity <= threshold ? 'low-stock' : '';

    return `
      <div class="item-card ${cardClass}">
        ${item.quantity === 0 ? '<div class="alert-badge">OUT</div>' : item.quantity <= threshold ? '<div class="alert-badge">LOW</div>' : ''}
        <div class="item-header">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <span class="item-sku">SKU: ${escapeHtml(item.sku)}</span>
          </div>
        </div>
        <span class="item-category">${escapeHtml(item.category)}</span>
        <div class="item-details">
          <div class="item-detail"><label>Quantity</label><strong>${item.quantity}</strong></div>
          <div class="item-detail"><label>Unit Price</label><strong>$${(item.price || 0).toFixed(2)}</strong></div>
          <div class="item-detail"><label>Stock Value</label><strong>$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</strong></div>
          <div class="item-detail"><label>Threshold</label><strong>${threshold}</strong></div>
        </div>
        <div class="stock-bar"><div class="stock-bar-fill ${stockClass}" style="width:${stockLevel}%"></div></div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" onclick="editItem('${item.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

function openItemModal(edit = false) {
  itemModal.classList.add('active');
  document.getElementById('modalTitle').textContent = edit ? 'Edit Item' : 'Add Item';
  if (!edit) { itemForm.reset(); document.getElementById('itemId').value = ''; }
}

function closeItemModal() { itemModal.classList.remove('active'); itemForm.reset(); document.getElementById('itemId').value = ''; }

addItemBtn.addEventListener('click', () => openItemModal(false));
closeModal.addEventListener('click', closeItemModal);
cancelBtn.addEventListener('click', closeItemModal);

itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('itemId').value;
  const name = document.getElementById('itemName').value.trim();
  const sku = document.getElementById('itemSku').value.trim().toUpperCase();
  const category = document.getElementById('itemCategory').value;
  const quantity = parseInt(document.getElementById('itemQuantity').value) || 0;
  const price = parseFloat(document.getElementById('itemPrice').value) || 0;
  const lowStockThreshold = parseInt(document.getElementById('itemThreshold').value) || 10;

  if (!name || name.length < 2) { showToast('Product name required (min 2 chars)', 'error'); return; }
  if (!sku || sku.length < 2) { showToast('SKU required (min 2 chars)', 'error'); return; }

  const data = { name, sku, category, quantity, price, lowStockThreshold };

  try {
    const url = id ? `${API}/inventory/${id}` : `${API}/inventory`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
    showToast(id ? 'Item updated!' : 'Item added!');
    closeItemModal();
    fetchInventory();
  } catch (err) { showToast(err.message, 'error'); }
});

window.editItem = function(id) {
  const item = inventory.find(i => i.id === id);
  if (!item) return;
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemSku').value = item.sku;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemQuantity').value = item.quantity;
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('itemThreshold').value = item.lowStockThreshold || 10;
  openItemModal(true);
};

window.deleteItem = async function(id) {
  if (!confirm('Delete this item?')) return;
  try {
    const res = await fetch(`${API}/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Item deleted');
    fetchInventory();
  } catch (err) { showToast(err.message, 'error'); }
};

function renderAlerts() {
  const alerts = inventory.filter(item => {
    const threshold = item.lowStockThreshold || 10;
    return item.quantity <= threshold;
  }).sort((a, b) => a.quantity - b.quantity);

  if (alerts.length === 0) {
    alertList.innerHTML = '<p class="empty-state">No low stock alerts. All items are well stocked!</p>';
    return;
  }

  alertList.innerHTML = alerts.map(item => {
    const threshold = item.lowStockThreshold || 10;
    const isOut = item.quantity === 0;
    return `
      <div class="alert-card ${isOut ? '' : 'warning'}">
        <div class="alert-icon">${isOut ? '&#x1f6d1;' : '&#x26a0;&#xfe0f;'}</div>
        <div class="alert-info">
          <h4>${escapeHtml(item.name)} (${escapeHtml(item.sku)})</h4>
          <p>${isOut ? 'Out of stock!' : `Only ${item.quantity} remaining (threshold: ${threshold})`}</p>
        </div>
        <div class="alert-actions">
          <button class="btn btn-primary btn-sm" onclick="restockItem('${item.id}')">Restock</button>
        </div>
      </div>
    `;
  }).join('');
}

window.restockItem = function(id) {
  const qty = prompt('Enter quantity to add:');
  if (!qty || isNaN(qty) || parseInt(qty) < 1) return;
  const item = inventory.find(i => i.id === id);
  if (!item) return;
  const newQty = item.quantity + parseInt(qty);
  fetch(`${API}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: newQty, name: item.name, sku: item.sku, category: item.category, price: item.price, lowStockThreshold: item.lowStockThreshold })
  }).then(res => res.json()).then(() => { showToast(`Restocked ${qty} units`); fetchInventory(); renderAlerts(); }).catch(() => showToast('Failed to restock', 'error'));
};

function renderSummary() {
  const totalItems = inventory.length;
  const totalQty = inventory.reduce((s, i) => s + i.quantity, 0);
  const totalValue = inventory.reduce((s, i) => s + (i.quantity * i.price), 0);
  const avgPrice = totalItems > 0 ? inventory.reduce((s, i) => s + i.price, 0) / totalItems : 0;
  const categories = [...new Set(inventory.map(i => i.category))];

  summaryGrid.innerHTML = `
    <div class="summary-card"><div class="summary-value">${totalItems}</div><div class="summary-label">Total Products</div></div>
    <div class="summary-card"><div class="summary-value">${totalQty}</div><div class="summary-label">Total Units</div></div>
    <div class="summary-card"><div class="summary-value">$${totalValue.toFixed(2)}</div><div class="summary-label">Total Stock Value</div></div>
    <div class="summary-card"><div class="summary-value">$${avgPrice.toFixed(2)}</div><div class="summary-label">Avg Unit Price</div></div>
  `;

  if (categories.length > 0) {
    const catHtml = categories.map(cat => {
      const items = inventory.filter(i => i.category === cat);
      const catQty = items.reduce((s, i) => s + i.quantity, 0);
      const catValue = items.reduce((s, i) => s + (i.quantity * i.price), 0);
      return `<div class="cat-row"><span class="cat-name">${escapeHtml(cat)}</span><span class="cat-count">${items.length} products, ${catQty} units</span><span class="cat-value">$${catValue.toFixed(2)}</span></div>`;
    }).join('');

    summaryGrid.innerHTML += `<div class="category-breakdown" style="grid-column:1/-1"><h3>Category Breakdown</h3>${catHtml}</div>`;
  }
}

searchInput.addEventListener('input', renderInventory);
categoryFilter.addEventListener('change', renderInventory);
stockFilter.addEventListener('change', renderInventory);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') { e.preventDefault(); openItemModal(false); }
  if (e.key === 'Escape') itemModal.classList.remove('active');
});

itemModal.addEventListener('click', (e) => { if (e.target === itemModal) closeItemModal(); });

fetchInventory();
