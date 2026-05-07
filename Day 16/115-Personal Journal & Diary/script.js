// DOM Elements
const entriesContainer = document.getElementById('entriesContainer');
const searchInput = document.getElementById('searchInput');
const moodFilter = document.getElementById('moodFilter');
const categoryFilter = document.getElementById('categoryFilter');
const addEntryBtn = document.getElementById('addEntryBtn');
const entryModal = document.getElementById('entryModal');
const modalTitle = document.getElementById('modalTitle');
const entryForm = document.getElementById('entryForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalCloseBtn = document.querySelector('.modal-close');
const moodButtons = document.querySelectorAll('.mood-btn');
const entryMoodInput = document.getElementById('entryMood');

let entries = [];
let editingEntryId = null;
let selectedMood = null;

// ===== LOAD & DISPLAY ENTRIES =====
async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to load entries');
        
        const text = await response.text();
        entries = text && text.trim() ? JSON.parse(text) : [];
        
        displayEntries(entries);
    } catch (error) {
        console.error('Error loading entries:', error);
        showToast('Failed to load entries', 'error');
        entries = [];
        displayEntries([]);
    }
}

function displayEntries(entriesToShow) {
    entriesContainer.innerHTML = '';
    
    if (entriesToShow.length === 0) {
        entriesContainer.innerHTML = `
            <div class="no-entries">
                <p>📔 No journal entries yet</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Start writing your thoughts and reflections!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    entriesToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    entriesToShow.forEach(entry => {
        const card = createEntryCard(entry);
        entriesContainer.appendChild(card);
    });
}

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    
    const date = new Date(entry.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const tags = entry.tags ? entry.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    card.innerHTML = `
        <div class="entry-header">
            <div class="entry-title-section">
                <div class="entry-date">${date}</div>
                <div class="entry-title">${escapeHtml(entry.title)}</div>
                <div class="entry-meta">
                    <span class="entry-mood">${entry.mood}</span>
                    <span class="entry-category">${entry.category}</span>
                </div>
            </div>
        </div>
        <div class="entry-content" id="content-${entry.id}">${escapeHtml(entry.content)}</div>
        ${tags.length > 0 ? `
            <div class="entry-tags">
                ${tags.map(tag => `<span class="entry-tag">#${escapeHtml(tag)}</span>`).join('')}
            </div>
        ` : ''}
        <div class="entry-actions">
            ${entry.content.length > 300 ? `<button class="expand-btn" onclick="toggleExpand('${entry.id}')">Read More</button>` : ''}
            <button class="btn btn-edit" onclick="openEditModal('${entry.id}')">✏️ Edit</button>
            <button class="btn btn-delete" onclick="deleteEntry('${entry.id}')">🗑️ Delete</button>
        </div>
    `;
    
    return card;
}

function toggleExpand(id) {
    const content = document.getElementById(`content-${id}`);
    const expandBtn = content.nextElementSibling?.querySelector('.expand-btn') || 
                      content.parentElement.querySelector('.expand-btn');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        expandBtn.textContent = 'Read More';
    } else {
        content.classList.add('expanded');
        expandBtn.textContent = 'Show Less';
    }
}

// ===== FILTER ENTRIES =====
function filterEntries() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedMood = moodFilter.value;
    const selectedCategory = categoryFilter.value;
    
    let filtered = entries;
    
    if (searchTerm) {
        filtered = filtered.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.content.toLowerCase().includes(searchTerm) ||
            (entry.tags && entry.tags.toLowerCase().includes(searchTerm))
        );
    }
    
    if (selectedMood !== 'all') {
        filtered = filtered.filter(entry => entry.mood === selectedMood);
    }
    
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(entry => entry.category === selectedCategory);
    }
    
    displayEntries(filtered);
}

searchInput.addEventListener('input', filterEntries);
moodFilter.addEventListener('change', filterEntries);
categoryFilter.addEventListener('change', filterEntries);

// ===== MODAL FUNCTIONS =====
function openAddModal() {
    editingEntryId = null;
    modalTitle.textContent = 'New Journal Entry';
    entryForm.reset();
    document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
    clearMoodSelection();
    entryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    editingEntryId = id;
    modalTitle.textContent = 'Edit Journal Entry';
    document.getElementById('entryDate').value = entry.date;
    document.getElementById('entryTitle').value = entry.title;
    document.getElementById('entryMood').value = entry.mood;
    document.getElementById('entryCategory').value = entry.category;
    document.getElementById('entryContent').value = entry.content;
    document.getElementById('entryTags').value = entry.tags || '';
    
    selectMood(entry.mood);
    entryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    entryModal.style.display = 'none';
    entryForm.reset();
    editingEntryId = null;
    clearMoodSelection();
    document.body.style.overflow = '';
}

addEntryBtn.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);

entryModal.addEventListener('click', (e) => {
    if (e.target === entryModal) closeModal();
});

// ===== MOOD SELECTOR =====
moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        selectMood(mood);
    });
});

function selectMood(mood) {
    selectedMood = mood;
    entryMoodInput.value = mood;
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector(`.mood-btn[data-mood="${mood}"]`);
    if (selectedBtn) selectedBtn.classList.add('selected');
}

function clearMoodSelection() {
    selectedMood = null;
    entryMoodInput.value = '';
    moodButtons.forEach(btn => btn.classList.remove('selected'));
}

// ===== FORM SUBMISSION =====
entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const entryData = {
        date: document.getElementById('entryDate').value,
        title: document.getElementById('entryTitle').value.trim(),
        mood: document.getElementById('entryMood').value,
        category: document.getElementById('entryCategory').value,
        content: document.getElementById('entryContent').value.trim(),
        tags: document.getElementById('entryTags').value.trim()
    };
    
    if (!entryData.mood) {
        showToast('Please select your mood', 'error');
        return;
    }
    
    try {
        if (editingEntryId) {
            await updateEntry(editingEntryId, entryData);
            showToast('✓ Entry updated successfully!', 'success');
        } else {
            await addEntry(entryData);
            showToast('✓ Entry saved successfully!', 'success');
        }
        closeModal();
        await loadEntries();
    } catch (error) {
        console.error('Error saving entry:', error);
        showToast('Failed to save entry', 'error');
    }
});

// ===== API FUNCTIONS =====
async function addEntry(entryData) {
    const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
    });
    
    const text = await response.text();
    if (!text || !text.trim()) throw new Error('Empty response');
    const result = JSON.parse(text);
    
    if (!response.ok) throw new Error(result.error || 'Failed to add entry');
    return result;
}

async function updateEntry(id, entryData) {
    const response = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
    });
    
    const text = await response.text();
    if (!text || !text.trim()) throw new Error('Empty response');
    const result = JSON.parse(text);
    
    if (!response.ok) throw new Error(result.error || 'Failed to update entry');
    return result;
}

async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/entries/${id}`, {
            method: 'DELETE'
        });
        
        const text = await response.text();
        if (!text || !text.trim()) throw new Error('Empty response');
        const result = JSON.parse(text);
        
        if (!response.ok) throw new Error(result.error || 'Failed to delete entry');
        
        showToast('✓ Entry deleted', 'success');
        await loadEntries();
    } catch (error) {
        console.error('Error deleting entry:', error);
        showToast('Failed to delete entry', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }
    
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
});
