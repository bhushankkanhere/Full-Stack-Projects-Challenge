// ============================================
// DOM Elements
// ============================================
const entriesList = document.getElementById('entriesList');
const searchInput = document.getElementById('searchInput');
const addEntryBtn = document.getElementById('addEntryBtn');
const entryModal = document.getElementById('entryModal');
const modalTitle = document.getElementById('modalTitle');
const entryForm = document.getElementById('entryForm');
const entryTitle = document.getElementById('entryTitle');
const entryAmount = document.getElementById('entryAmount');
const entryType = document.getElementById('entryType');
const entryCategory = document.getElementById('entryCategory');
const entryDate = document.getElementById('entryDate');
const entryDescription = document.getElementById('entryDescription');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.getElementById('closeBtn');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const monthFilter = document.getElementById('monthFilter');
const titleError = document.getElementById('titleError');
const amountError = document.getElementById('amountError');

// Summary elements
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const balance = document.getElementById('balance');

// State
let entries = [];
let editingEntryId = null;

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    setupEventListeners();
    setDefaultDate();
});

function setupEventListeners() {
    addEntryBtn.addEventListener('click', openAddModal);
    entryForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    entryModal.addEventListener('click', (e) => {
        if (e.target === entryModal) closeModal();
    });

    searchInput.addEventListener('input', filterAndDisplayEntries);
    typeFilter.addEventListener('change', filterAndDisplayEntries);
    categoryFilter.addEventListener('change', filterAndDisplayEntries);
    monthFilter.addEventListener('change', filterAndDisplayEntries);

    document.addEventListener('keydown', handleKeyboard);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    entryDate.value = today;
}

// ============================================
// API Functions
// ============================================
async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to load entries');
        entries = await response.json();
        filterAndDisplayEntries();
        updateSummary();
        showToast('✓ Entries loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading entries:', error);
        showToast('Failed to load entries', 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    const entryData = {
        title: entryTitle.value.trim(),
        amount: parseFloat(entryAmount.value),
        type: entryType.value,
        category: entryCategory.value,
        date: entryDate.value,
        description: entryDescription.value.trim()
    };

    try {
        if (editingEntryId) {
            await updateEntry(editingEntryId, entryData);
            showToast('✓ Entry updated successfully!', 'success');
        } else {
            await createEntry(entryData);
            showToast('✓ Entry created successfully!', 'success');
        }
        closeModal();
        await loadEntries();
    } catch (error) {
        console.error('Error saving entry:', error);
        showToast('Failed to save entry', 'error');
    }
}

async function createEntry(entryData) {
    const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
    });
    
    if (!response.ok) throw new Error('Failed to create entry');
    return await response.json();
}

async function updateEntry(id, entryData) {
    const response = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
    });
    
    if (!response.ok) throw new Error('Failed to update entry');
    return await response.json();
}

async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/entries/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete entry');
        showToast('✓ Entry deleted successfully!', 'success');
        await loadEntries();
    } catch (error) {
        console.error('Error deleting entry:', error);
        showToast('Failed to delete entry', 'error');
    }
}

// ============================================
// Modal Functions
// ============================================
function openAddModal() {
    editingEntryId = null;
    modalTitle.textContent = 'Add New Entry';
    entryForm.reset();
    setDefaultDate();
    clearErrors();
    entryModal.style.display = 'block';
    entryTitle.focus();
}

function openEditModal(entry) {
    editingEntryId = entry.id;
    modalTitle.textContent = 'Edit Entry';
    entryTitle.value = entry.title;
    entryAmount.value = entry.amount;
    entryType.value = entry.type;
    entryCategory.value = entry.category;
    entryDate.value = entry.date.split('T')[0];
    entryDescription.value = entry.description || '';
    clearErrors();
    entryModal.style.display = 'block';
    entryTitle.focus();
}

function closeModal() {
    entryModal.style.display = 'none';
    entryForm.reset();
    editingEntryId = null;
    clearErrors();
}

function clearErrors() {
    titleError.textContent = '';
    amountError.textContent = '';
}

// ============================================
// Form Validation
// ============================================
function validateForm() {
    let isValid = true;
    clearErrors();

    const title = entryTitle.value.trim();
    const amount = parseFloat(entryAmount.value);

    if (!title) {
        titleError.textContent = 'Title is required';
        entryTitle.focus();
        isValid = false;
    } else if (title.length > 100) {
        titleError.textContent = 'Title must be less than 100 characters';
        entryTitle.focus();
        isValid = false;
    }

    if (!amount || amount <= 0) {
        amountError.textContent = 'Amount must be greater than 0';
        if (isValid) entryAmount.focus();
        isValid = false;
    }

    return isValid;
}

entryTitle.addEventListener('input', () => { if (titleError.textContent) titleError.textContent = ''; });
entryAmount.addEventListener('input', () => { if (amountError.textContent) amountError.textContent = ''; });

// ============================================
// Display Functions
// ============================================
function filterAndDisplayEntries() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const type = typeFilter.value;
    const category = categoryFilter.value;
    const month = monthFilter.value;

    const filtered = entries.filter(entry => {
        const matchesSearch = !searchTerm || 
            entry.title.toLowerCase().includes(searchTerm) ||
            (entry.description && entry.description.toLowerCase().includes(searchTerm));
        
        const matchesType = !type || entry.type === type;
        const matchesCategory = !category || entry.category === category;
        
        const matchesMonth = !month || (() => {
            const entryMonth = entry.date.substring(0, 7);
            return entryMonth === month;
        })();

        return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });

    displayEntries(filtered);
    updateSummary();
}

function displayEntries(entriesToDisplay) {
    entriesList.innerHTML = '';

    if (entriesToDisplay.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <h3>No entries found</h3>
                <p>${entries.length === 0 ? 'Click "Add Entry" to track your finances!' : 'No entries match your filters'}</p>
            </div>
        `;
        return;
    }

    const sorted = entriesToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(entry => {
        const entryCard = createEntryCard(entry);
        entriesList.appendChild(entryCard);
    });
}

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = `entry-card ${entry.type}`;
    
    const formattedDate = formatDate(entry.date);
    const amountPrefix = entry.type === 'income' ? '+' : '-';

    card.innerHTML = `
        <div class="entry-header">
            <div class="entry-title-section">
                <div class="entry-title">${escapeHtml(entry.title)}</div>
                ${entry.description ? `<div class="entry-description">${escapeHtml(entry.description)}</div>` : ''}
            </div>
        </div>
        
        <div class="entry-amount ${entry.type}">
            ${amountPrefix}$${formatCurrency(entry.amount)}
        </div>
        
        <div class="entry-meta">
            <span class="entry-badge badge-type ${entry.type}">${entry.type === 'income' ? '📈' : '📉'} ${entry.type}</span>
            <span class="entry-badge badge-category">${getCategoryIcon(entry.category)} ${escapeHtml(entry.category)}</span>
            <span class="entry-badge badge-date">📅 ${formattedDate}</span>
        </div>
        
        <div class="entry-actions">
            <button class="btn btn-small btn-edit" data-id="${entry.id}">✏️ Edit</button>
            <button class="btn btn-small btn-delete" data-id="${entry.id}">🗑️ Delete</button>
        </div>
    `;

    card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(entry));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteEntry(entry.id));

    return card;
}

function updateSummary() {
    const income = entries
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const expenses = entries
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const bal = income - expenses;

    totalIncome.textContent = `$${formatCurrency(income)}`;
    totalExpenses.textContent = `$${formatCurrency(expenses)}`;
    balance.textContent = `$${formatCurrency(bal)}`;
}

// ============================================
// Utility Functions
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getCategoryIcon(category) {
    const icons = {
        'Salary': '💼',
        'Freelance': '💻',
        'Food': '🍔',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Bills': '📄',
        'Entertainment': '🎬',
        'Health': '🏥',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Keyboard Shortcuts
// ============================================
function handleKeyboard(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }

    if (e.key === 'Escape' && entryModal.style.display === 'block') {
        closeModal();
    }
}
