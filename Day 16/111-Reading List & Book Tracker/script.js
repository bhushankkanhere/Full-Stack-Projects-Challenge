const API_URL = 'http://localhost:3009/api/books';

let allBooks = [];
let editingBookId = null;
let deletingBookId = null;
let selectedDetailBookId = null;
let currentRating = 0;

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    statusFilter: document.getElementById('statusFilter'),
    genreFilter: document.getElementById('genreFilter'),
    addBookBtn: document.getElementById('addBookBtn'),
    booksList: document.getElementById('booksList'),
    bookModal: document.getElementById('bookModal'),
    bookForm: document.getElementById('bookForm'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    submitBtn: document.getElementById('submitBtn'),
    bookId: document.getElementById('bookId'),
    bookTitle: document.getElementById('bookTitle'),
    bookAuthor: document.getElementById('bookAuthor'),
    bookISBN: document.getElementById('bookISBN'),
    bookPages: document.getElementById('bookPages'),
    bookGenre: document.getElementById('bookGenre'),
    bookStatus: document.getElementById('bookStatus'),
    bookProgress: document.getElementById('bookProgress'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    starRating: document.getElementById('starRating'),
    ratingText: document.getElementById('ratingText'),
    bookNotes: document.getElementById('bookNotes'),
    titleError: document.getElementById('titleError'),
    authorError: document.getElementById('authorError'),
    pagesError: document.getElementById('pagesError'),
    bookDetailModal: document.getElementById('bookDetailModal'),
    closeDetailModal: document.getElementById('closeDetailModal'),
    detailTitle: document.getElementById('detailTitle'),
    detailAuthor: document.getElementById('detailAuthor'),
    detailISBN: document.getElementById('detailISBN'),
    detailISBNItem: document.getElementById('detailISBNItem'),
    detailPages: document.getElementById('detailPages'),
    detailGenre: document.getElementById('detailGenre'),
    detailGenreItem: document.getElementById('detailGenreItem'),
    detailStatus: document.getElementById('detailStatus'),
    detailProgress: document.getElementById('detailProgress'),
    detailRating: document.getElementById('detailRating'),
    detailNotes: document.getElementById('detailNotes'),
    detailNotesItem: document.getElementById('detailNotesItem'),
    editBookBtn: document.getElementById('editBookBtn'),
    deleteBookBtn: document.getElementById('deleteBookBtn'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    closeDeleteModal: document.getElementById('closeDeleteModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    toastContainer: document.getElementById('toastContainer'),
    totalBooks: document.getElementById('totalBooks'),
    readingBooks: document.getElementById('readingBooks'),
    finishedBooks: document.getElementById('finishedBooks'),
    totalPages: document.getElementById('totalPages')
};

// Initialize
async function init() {
    await loadBooks();
    setupEventListeners();
    setupStarRating();
    setupProgressTracking();
}

async function loadBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load books');
        allBooks = await response.json();
        renderBooks();
        updateStats();
    } catch (error) {
        showToast('Failed to load books', 'error');
        console.error(error);
    }
}

function setupEventListeners() {
    elements.searchBtn.addEventListener('click', filterBooks);
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterBooks();
        if (elements.searchInput.value === '') filterBooks();
    });
    elements.statusFilter.addEventListener('change', filterBooks);
    elements.genreFilter.addEventListener('change', filterBooks);
    elements.addBookBtn.addEventListener('click', openAddModal);
    elements.closeModal.addEventListener('click', closeAddModal);
    elements.cancelBtn.addEventListener('click', closeAddModal);
    elements.bookForm.addEventListener('submit', handleFormSubmit);
    elements.closeDetailModal.addEventListener('click', closeDetailModal);
    elements.editBookBtn.addEventListener('click', editBookFromDetail);
    elements.deleteBookBtn.addEventListener('click', openDeleteModal);
    elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeDetailModal();
            closeDeleteModal();
        }
    });

    elements.bookModal.addEventListener('click', (e) => {
        if (e.target === elements.bookModal) closeAddModal();
    });
    elements.bookDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.bookDetailModal) closeDetailModal();
    });
    elements.deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteConfirmModal) closeDeleteModal();
    });
}

function setupStarRating() {
    const stars = elements.starRating.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStarDisplay();
        });
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
            });
        });
        star.addEventListener('mouseleave', () => {
            updateStarDisplay();
        });
    });
}

function updateStarDisplay() {
    const stars = elements.starRating.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.toggle('active', parseInt(star.dataset.rating) <= currentRating);
    });
    const ratingLabels = ['No rating', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    elements.ratingText.textContent = ratingLabels[currentRating];
}

function setupProgressTracking() {
    elements.bookProgress.addEventListener('input', updateProgressBar);
    elements.bookPages.addEventListener('input', updateProgressBar);
    elements.bookStatus.addEventListener('change', handleStatusChange);
}

function updateProgressBar() {
    const pages = parseInt(elements.bookPages.value) || 0;
    const progress = parseInt(elements.bookProgress.value) || 0;
    const percentage = pages > 0 ? Math.min(100, Math.round((progress / pages) * 100)) : 0;
    elements.progressBar.style.width = percentage + '%';
    elements.progressText.textContent = progress + ' / ' + pages + ' pages (' + percentage + '%)';
}

function handleStatusChange() {
    if (elements.bookStatus.value === 'Finished') {
        const pages = parseInt(elements.bookPages.value) || 0;
        if (pages > 0) {
            elements.bookProgress.value = pages;
            updateProgressBar();
        }
    }
}

function filterBooks() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const status = elements.statusFilter.value;
    const genre = elements.genreFilter.value;

    let filtered = allBooks.filter(book => {
        const matchesSearch = !searchTerm ||
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchTerm));

        const matchesStatus = !status || book.status === status;
        const matchesGenre = !genre || book.genre === genre;

        return matchesSearch && matchesStatus && matchesGenre;
    });

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderBookList(filtered);
}

function renderBooks() {
    const sorted = [...allBooks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderBookList(sorted);
}

function renderBookList(books) {
    if (books.length === 0) {
        elements.booksList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>No books found</h3>
                <p>Try adjusting your filters or add a new book</p>
            </div>
        `;
        return;
    }

    elements.booksList.innerHTML = books.map(book => {
        const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
        const statusClass = book.status === 'Reading' ? 'reading' : book.status === 'Finished' ? 'finished' : 'want';
        const stars = book.rating > 0 ? '&#9733;'.repeat(book.rating) + '&#9734;'.repeat(5 - book.rating) : '';

        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-status-indicator ${statusClass}"></div>
                <div class="book-header">
                    <div class="book-title">${escapeHtml(book.title)}</div>
                    <div class="book-author">by ${escapeHtml(book.author)}</div>
                </div>
                <div class="book-meta">
                    ${book.genre ? '<span class="book-genre-badge">' + escapeHtml(book.genre) + '</span>' : ''}
                    <span class="book-status-badge ${statusClass}">${book.status}</span>
                    <span>${book.pages} pages</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${book.currentPage} / ${book.pages} pages (${progress}%)</span>
                ${stars ? '<div class="book-rating">' + stars + '</div>' : ''}
            </div>
        `;
    }).join('');

    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => openDetailModal(card.dataset.id));
    });
}

function openAddModal() {
    editingBookId = null;
    elements.modalTitle.textContent = 'Add New Book';
    elements.bookForm.reset();
    elements.bookId.value = '';
    currentRating = 0;
    updateStarDisplay();
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';
    elements.titleError.textContent = '';
    elements.authorError.textContent = '';
    elements.pagesError.textContent = '';
    elements.bookModal.classList.remove('hidden');
    elements.bookTitle.focus();
}

function openEditModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    editingBookId = bookId;
    elements.modalTitle.textContent = 'Edit Book';
    elements.bookId.value = book.id;
    elements.bookTitle.value = book.title;
    elements.bookAuthor.value = book.author;
    elements.bookISBN.value = book.isbn || '';
    elements.bookPages.value = book.pages;
    elements.bookGenre.value = book.genre || '';
    elements.bookStatus.value = book.status;
    elements.bookProgress.value = book.currentPage;
    currentRating = book.rating || 0;
    elements.bookNotes.value = book.notes || '';
    updateStarDisplay();
    updateProgressBar();
    elements.titleError.textContent = '';
    elements.authorError.textContent = '';
    elements.pagesError.textContent = '';
    elements.bookModal.classList.remove('hidden');
    closeDetailModal();
}

function closeAddModal() {
    elements.bookModal.classList.add('hidden');
    editingBookId = null;
    elements.bookForm.reset();
    currentRating = 0;
    updateStarDisplay();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const pages = parseInt(elements.bookPages.value) || 1;
    const currentPage = Math.min(parseInt(elements.bookProgress.value) || 0, pages);

    const bookData = {
        title: elements.bookTitle.value.trim(),
        author: elements.bookAuthor.value.trim(),
        isbn: elements.bookISBN.value.trim(),
        pages: pages,
        currentPage: currentPage,
        genre: elements.bookGenre.value,
        status: elements.bookStatus.value,
        rating: currentRating,
        notes: elements.bookNotes.value.trim()
    };

    try {
        let response;
        if (editingBookId) {
            response = await fetch(`${API_URL}/${editingBookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            if (!response.ok) throw new Error('Failed to update book');
            showToast('Book updated successfully', 'success');
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            if (!response.ok) throw new Error('Failed to create book');
            showToast('Book added successfully', 'success');
        }

        await loadBooks();
        closeAddModal();
    } catch (error) {
        showToast('Failed to save book', 'error');
        console.error(error);
    }
}

function validateForm() {
    let valid = true;
    elements.titleError.textContent = '';
    elements.authorError.textContent = '';
    elements.pagesError.textContent = '';
    elements.bookTitle.classList.remove('invalid');
    elements.bookAuthor.classList.remove('invalid');
    elements.bookPages.classList.remove('invalid');

    const title = elements.bookTitle.value.trim();
    if (!title) {
        elements.titleError.textContent = 'Title is required';
        elements.bookTitle.classList.add('invalid');
        valid = false;
    }

    const author = elements.bookAuthor.value.trim();
    if (!author) {
        elements.authorError.textContent = 'Author is required';
        elements.bookAuthor.classList.add('invalid');
        valid = false;
    }

    const pages = parseInt(elements.bookPages.value);
    if (!pages || pages < 1) {
        elements.pagesError.textContent = 'Pages must be at least 1';
        elements.bookPages.classList.add('invalid');
        valid = false;
    }

    const progress = parseInt(elements.bookProgress.value) || 0;
    if (pages && progress > pages) {
        elements.pagesError.textContent = 'Pages read cannot exceed total pages';
        elements.bookProgress.classList.add('invalid');
        valid = false;
    }

    return valid;
}

function openDetailModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    selectedDetailBookId = bookId;
    elements.detailTitle.textContent = book.title;
    elements.detailAuthor.textContent = book.author;

    if (book.isbn) {
        elements.detailISBNItem.classList.remove('hidden');
        elements.detailISBN.textContent = book.isbn;
    } else {
        elements.detailISBNItem.classList.add('hidden');
    }

    const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
    elements.detailPages.textContent = book.currentPage + ' / ' + book.pages + ' pages';

    if (book.genre) {
        elements.detailGenreItem.classList.remove('hidden');
        elements.detailGenre.textContent = book.genre;
    } else {
        elements.detailGenreItem.classList.add('hidden');
    }

    const statusClass = book.status === 'Reading' ? 'reading' : book.status === 'Finished' ? 'finished' : 'want';
    elements.detailStatus.innerHTML = '<span class="book-status-badge ' + statusClass + '">' + book.status + '</span>';
    elements.detailProgress.textContent = progress + '% complete';

    if (book.rating > 0) {
        elements.detailRating.innerHTML = '<span class="detail-rating">' + '&#9733;'.repeat(book.rating) + '&#9734;'.repeat(5 - book.rating) + '</span>';
    } else {
        elements.detailRating.textContent = 'Not rated';
    }

    if (book.notes) {
        elements.detailNotesItem.classList.remove('hidden');
        elements.detailNotes.textContent = book.notes;
    } else {
        elements.detailNotesItem.classList.add('hidden');
    }

    elements.bookDetailModal.classList.remove('hidden');
}

function closeDetailModal() {
    elements.bookDetailModal.classList.add('hidden');
    selectedDetailBookId = null;
}

function editBookFromDetail() {
    if (selectedDetailBookId) {
        openEditModal(selectedDetailBookId);
    }
}

function openDeleteModal() {
    if (selectedDetailBookId) {
        deletingBookId = selectedDetailBookId;
        elements.deleteConfirmModal.classList.remove('hidden');
        closeDetailModal();
    }
}

function closeDeleteModal() {
    elements.deleteConfirmModal.classList.add('hidden');
    deletingBookId = null;
}

async function confirmDelete() {
    if (!deletingBookId) return;

    try {
        const response = await fetch(`${API_URL}/${deletingBookId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete book');

        showToast('Book deleted successfully', 'success');
        await loadBooks();
        closeDeleteModal();
    } catch (error) {
        showToast('Failed to delete book', 'error');
        console.error(error);
    }
}

function updateStats() {
    const total = allBooks.length;
    const reading = allBooks.filter(b => b.status === 'Reading').length;
    const finished = allBooks.filter(b => b.status === 'Finished').length;
    const pagesRead = allBooks.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    elements.totalBooks.textContent = total;
    elements.readingBooks.textContent = reading;
    elements.finishedBooks.textContent = finished;
    elements.totalPages.textContent = pagesRead.toLocaleString();
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
