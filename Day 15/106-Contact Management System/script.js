// Local Storage Backend
const STORAGE_KEY = 'contacts_database';

// DOM Elements
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const cancelBtn = document.getElementById('cancelBtn');
const contactsList = document.getElementById('contactsList');
const searchInput = document.getElementById('searchInput');
const contactCount = document.getElementById('contactCount');

// State
let contacts = [];
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    contactForm.addEventListener('submit', handleFormSubmit);
    clearBtn.addEventListener('click', clearForm);
    cancelBtn.addEventListener('click', cancelEdit);
    searchInput.addEventListener('input', filterContacts);
}

// Load Contacts from Local Storage
function loadContacts() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        contacts = stored ? JSON.parse(stored) : [];
        displayContacts(contacts);
        updateContactCount(contacts.length);
        showToast('✓ Contacts loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading contacts:', error);
        contacts = [];
        showToast('Using fresh contacts database', 'info');
    }
}

// Save Contacts to Local Storage
function saveContacts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
        console.error('Error saving contacts:', error);
        showToast('Failed to save contacts', 'error');
    }
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please enter at least a name', 'warning');
        return;
    }

    const contactData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim()
    };

    try {
        if (editingId) {
            // Update existing contact
            const contactIndex = contacts.findIndex(c => c.id === editingId);
            if (contactIndex !== -1) {
                contacts[contactIndex] = {
                    ...contacts[contactIndex],
                    ...contactData,
                    updatedAt: new Date().toISOString()
                };
                showToast('✓ Contact updated successfully!', 'success');
            }
            editingId = null;
        } else {
            // Add new contact
            const newContact = {
                id: Date.now().toString(),
                ...contactData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            contacts.push(newContact);
            showToast('✓ Contact added successfully!', 'success');
        }

        saveContacts();
        clearForm();
        cancelEdit();
        displayContacts(contacts);
        updateContactCount(contacts.length);
    } catch (error) {
        console.error('Error saving contact:', error);
        showToast('Error saving contact', 'error');
    }
}

// Validate Form
function validateForm() {
    return nameInput.value.trim().length > 0;
}

// Clear Form
function clearForm() {
    contactForm.reset();
    nameInput.focus();
}

// Cancel Edit
function cancelEdit() {
    editingId = null;
    addBtn.textContent = 'Add Contact';
    cancelBtn.style.display = 'none';
    clearForm();
}

// Edit Contact
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    nameInput.value = contact.name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;
    addressInput.value = contact.address;

    editingId = id;
    addBtn.textContent = 'Update Contact';
    cancelBtn.style.display = 'block';
    nameInput.focus();

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
        contacts = contacts.filter(contact => contact.id !== id);
        saveContacts();
        showToast('✓ Contact deleted successfully!', 'success');
        displayContacts(contacts);
        updateContactCount(contacts.lengthntact deleted successfully!', 'success');
        loadContacts();
    } catch (error) {
        console.error('Error deleting contact:', error);
        showToast('Error deleting contact', 'error');
    }
}

// Display Contacts
function displayContacts(contactsToDisplay) {
    if (contactsToDisplay.length === 0) {
        contactsList.innerHTML = '<p class="empty-message">No contacts yet. Add one to get started!</p>';
        return;
    }

    contactsList.innerHTML = contactsToDisplay.map(contact => `
        <div class="contact-card">
            <div class="contact-name">${escapeHtml(contact.name)}</div>
            ${contact.email ? `<div class="contact-info"><strong>Email:</strong> ${escapeHtml(contact.email)}</div>` : ''}
            ${contact.phone ? `<div class="contact-info"><strong>Phone:</strong> ${escapeHtml(contact.phone)}</div>` : ''}
            ${contact.address ? `<div class="contact-info"><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            <div class="card-actions">
                <button class="btn-small btn-edit" onclick="editContact('${contact.id}')">✎ Edit</button>
                <button class="btn-small btn-delete" onclick="deleteContact('${contact.id}')">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

// Filter Contacts
function filterContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.phone.toLowerCase().includes(searchTerm) ||
        contact.address.toLowerCase().includes(searchTerm)
    );

    displayContacts(filtered);
    updateContactCount(filtered.length);
}

// Update Contact Count
function updateContactCount(count) {
    contactCount.textContent = `${count} contact${count !== 1 ? 's' : ''}`;
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to cancel edit
    if (e.key === 'Escape' && editingId) {
        cancelEdit();
    }
});
