// State Management
let bookmarks = [];
let currentFilter = { search: '', folder: '', tag: '' };

// DOM Elements
const addBookmarkBtn = document.getElementById('addBookmarkBtn');
const bookmarkModal = document.getElementById('bookmarkModal');
const bookmarkForm = document.getElementById('bookmarkForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const folderFilter = document.getElementById('folderFilter');
const tagFilter = document.getElementById('tagFilter');
const bookmarksContainer = document.getElementById('bookmarksContainer');
const emptyState = document.getElementById('emptyState');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    addBookmarkBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalHandler());
    cancelBtn.addEventListener('click', () => closeModalHandler());
    bookmarkForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value.toLowerCase();
        renderBookmarks();
    });
    folderFilter.addEventListener('change', (e) => {
        currentFilter.folder = e.target.value;
        renderBookmarks();
    });
    tagFilter.addEventListener('change', (e) => {
        currentFilter.tag = e.target.value;
        renderBookmarks();
    });

    // Close modal on outside click
    bookmarkModal.addEventListener('click', (e) => {
        if (e.target === bookmarkModal) {
            closeModalHandler();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openModal();
        }
        if (e.key === 'Escape' && bookmarkModal.classList.contains('active')) {
            closeModalHandler();
        }
    });
}

// API Functions
async function loadBookmarks() {
    try {
        const response = await fetch('http://localhost:3006/api/bookmarks');
        if (!response.ok) throw new Error('Failed to load bookmarks');
        bookmarks = await response.json();
        updateFilters();
        renderBookmarks();
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        showToast('Failed to load bookmarks', 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('bookmarkId').value;
    const bookmarkData = {
        title: document.getElementById('title').value.trim(),
        url: document.getElementById('url').value.trim(),
        description: document.getElementById('description').value.trim(),
        folder: document.getElementById('folder').value.trim(),
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
        createdAt: new Date().toISOString()
    };

    try {
        let response;
        if (id) {
            // Update existing bookmark
            response = await fetch(`http://localhost:3006/api/bookmarks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmarkData)
            });
        } else {
            // Create new bookmark
            response = await fetch('http://localhost:3006/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmarkData)
            });
        }

        if (!response.ok) throw new Error('Failed to save bookmark');
        
        showToast(id ? 'Bookmark updated successfully!' : 'Bookmark added successfully!', 'success');
        closeModalHandler();
        await loadBookmarks();
    } catch (error) {
        console.error('Error saving bookmark:', error);
        showToast('Failed to save bookmark', 'error');
    }
}

async function deleteBookmark(id) {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;

    try {
        const response = await fetch(`http://localhost:3006/api/bookmarks/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete bookmark');
        
        showToast('Bookmark deleted successfully!', 'success');
        await loadBookmarks();
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        showToast('Failed to delete bookmark', 'error');
    }
}

// UI Functions
function openModal(bookmark = null) {
    if (bookmark) {
        modalTitle.textContent = 'Edit Bookmark';
        document.getElementById('bookmarkId').value = bookmark.id;
        document.getElementById('title').value = bookmark.title;
        document.getElementById('url').value = bookmark.url;
        document.getElementById('description').value = bookmark.description || '';
        document.getElementById('folder').value = bookmark.folder || '';
        document.getElementById('tags').value = (bookmark.tags || []).join(', ');
    } else {
        modalTitle.textContent = 'Add Bookmark';
        bookmarkForm.reset();
        document.getElementById('bookmarkId').value = '';
    }
    bookmarkModal.classList.add('active');
}

function closeModalHandler() {
    bookmarkModal.classList.remove('active');
    bookmarkForm.reset();
}

function renderBookmarks() {
    let filtered = bookmarks.filter(bookmark => {
        const matchesSearch = !currentFilter.search || 
            bookmark.title.toLowerCase().includes(currentFilter.search) ||
            (bookmark.description && bookmark.description.toLowerCase().includes(currentFilter.search)) ||
            bookmark.url.toLowerCase().includes(currentFilter.search);
        
        const matchesFolder = !currentFilter.folder || bookmark.folder === currentFilter.folder;
        const matchesTag = !currentFilter.tag || 
            (bookmark.tags && bookmark.tags.includes(currentFilter.tag));

        return matchesSearch && matchesFolder && matchesTag;
    });

    if (filtered.length === 0) {
        bookmarksContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    bookmarksContainer.innerHTML = filtered.map(bookmark => createBookmarkCard(bookmark)).join('');
    
    // Attach event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const bookmark = bookmarks.find(b => b.id === id);
            openModal(bookmark);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteBookmark(btn.dataset.id);
        });
    });
}

function createBookmarkCard(bookmark) {
    const folderHtml = bookmark.folder ? `<span class="bookmark-folder">${escapeHtml(bookmark.folder)}</span>` : '';
    const tagsHtml = (bookmark.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const descriptionHtml = bookmark.description ? `<p class="bookmark-description">${escapeHtml(bookmark.description)}</p>` : '';
    const date = new Date(bookmark.createdAt).toLocaleDateString();

    return `
        <div class="bookmark-card">
            <div class="bookmark-header">
                <a href="${escapeHtml(bookmark.url)}" target="_blank" class="bookmark-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    ${escapeHtml(bookmark.title)}
                </a>
                <div class="bookmark-actions">
                    <button class="action-btn edit edit-btn" data-id="${bookmark.id}" title="Edit">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete delete-btn" data-id="${bookmark.id}" title="Delete">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="bookmark-url">${escapeHtml(bookmark.url)}</div>
            ${descriptionHtml}
            <div class="bookmark-meta">
                ${folderHtml}
                <div class="bookmark-tags">${tagsHtml}</div>
            </div>
            <div class="bookmark-date">Added on ${date}</div>
        </div>
    `;
}

function updateFilters() {
    const folders = [...new Set(bookmarks.map(b => b.folder).filter(f => f))];
    const tags = [...new Set(bookmarks.flatMap(b => b.tags || []))];

    folderFilter.innerHTML = '<option value="">All Folders</option>' + 
        folders.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('');
    
    tagFilter.innerHTML = '<option value="">All Tags</option>' + 
        tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
