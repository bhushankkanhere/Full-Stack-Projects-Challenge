// ============================================
// DOM Elements
// ============================================
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.getElementById('closeBtn');
const saveBtn = document.getElementById('saveBtn');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const statusFilter = document.getElementById('statusFilter');
const titleError = document.getElementById('titleError');

// Stats elements
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const urgentCount = document.getElementById('urgentCount');

// State
let tasks = [];
let editingTaskId = null;

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

function setupEventListeners() {
    addTaskBtn.addEventListener('click', openAddModal);
    taskForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    // Filters
    searchInput.addEventListener('input', filterAndDisplayTasks);
    categoryFilter.addEventListener('change', filterAndDisplayTasks);
    priorityFilter.addEventListener('change', filterAndDisplayTasks);
    statusFilter.addEventListener('change', filterAndDisplayTasks);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// ============================================
// API Functions
// ============================================
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to load tasks');
        tasks = await response.json();
        filterAndDisplayTasks();
        updateStats();
        showToast('✓ Tasks loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    const taskData = {
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        category: taskCategory.value,
        priority: taskPriority.value,
        dueDate: taskDueDate.value || null
    };

    try {
        if (editingTaskId) {
            await updateTask(editingTaskId, taskData);
            showToast('✓ Task updated successfully!', 'success');
        } else {
            await createTask(taskData);
            showToast('✓ Task created successfully!', 'success');
        }
        closeModal();
        await loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showToast('Failed to save task', 'error');
    }
}

async function createTask(taskData) {
    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    
    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
}

async function updateTask(id, taskData) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    
    if (!response.ok) throw new Error('Failed to update task');
    return await response.json();
}

async function toggleComplete(id) {
    try {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !task.completed })
        });

        if (!response.ok) throw new Error('Failed to toggle task');
        await loadTasks();
        showToast(`✓ Task marked as ${!task.completed ? 'completed' : 'pending'}`, 'success');
    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Failed to update task status', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');
        showToast('✓ Task deleted successfully!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    }
}

// ============================================
// Modal Functions
// ============================================
function openAddModal() {
    editingTaskId = null;
    modalTitle.textContent = 'Add New Task';
    taskForm.reset();
    taskPriority.value = 'Medium';
    titleError.textContent = '';
    taskModal.style.display = 'block';
    taskTitle.focus();
}

function openEditModal(task) {
    editingTaskId = task.id;
    modalTitle.textContent = 'Edit Task';
    taskTitle.value = task.title;
    taskDescription.value = task.description || '';
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate ? task.dueDate.split('T')[0] : '';
    titleError.textContent = '';
    taskModal.style.display = 'block';
    taskTitle.focus();
}

function closeModal() {
    taskModal.style.display = 'none';
    taskForm.reset();
    editingTaskId = null;
    titleError.textContent = '';
}

// ============================================
// Form Validation
// ============================================
function validateForm() {
    const title = taskTitle.value.trim();
    const category = taskCategory.value;

    if (!title) {
        titleError.textContent = 'Task title is required';
        taskTitle.focus();
        return false;
    }

    if (title.length > 150) {
        titleError.textContent = 'Title must be less than 150 characters';
        taskTitle.focus();
        return false;
    }

    if (!category) {
        titleError.textContent = 'Please select a category';
        taskCategory.focus();
        return false;
    }

    titleError.textContent = '';
    return true;
}

// Clear error on input
taskTitle.addEventListener('input', () => {
    if (titleError.textContent) {
        titleError.textContent = '';
    }
});

// ============================================
// Display Functions
// ============================================
function filterAndDisplayTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const priority = priorityFilter.value;
    const status = statusFilter.value;

    const filtered = tasks.filter(task => {
        const matchesSearch = !searchTerm ||
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm));

        const matchesCategory = !category || task.category === category;
        const matchesPriority = !priority || task.priority === priority;
        const matchesStatus = !status || 
            (status === 'completed' && task.completed) ||
            (status === 'pending' && !task.completed);

        return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });

    displayTasks(filtered);
    updateStats();
}

function displayTasks(tasksToDisplay) {
    tasksList.innerHTML = '';

    if (tasksToDisplay.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No tasks found</h3>
                <p>${tasks.length === 0 ? 'Click "Add Task" to create your first task!' : 'No tasks match your filters'}</p>
            </div>
        `;
        return;
    }

    // Sort: pending first, then by priority
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const sorted = tasksToDisplay.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksList.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    
    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
    const formattedDate = task.dueDate ? formatDate(task.dueDate) : null;

    card.innerHTML = `
        <div class="task-header">
            <div class="task-title-section">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            </div>
        </div>
        
        <div class="task-meta">
            <span class="task-badge badge-category">${getCategoryIcon(task.category)} ${escapeHtml(task.category)}</span>
            <span class="task-badge badge-priority ${task.priority}">${task.priority}</span>
            ${formattedDate ? `<span class="task-badge badge-due-date ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️' : '📅'} ${formattedDate}</span>` : ''}
        </div>
        
        <div class="task-actions">
            <button class="btn btn-small btn-complete" data-id="${task.id}">
                ${task.completed ? '↩️ Reopen' : '✅ Complete'}
            </button>
            <button class="btn btn-small btn-edit" data-id="${task.id}">✏️ Edit</button>
            <button class="btn btn-small btn-delete" data-id="${task.id}">🗑️ Delete</button>
        </div>
    `;

    // Event listeners
    card.querySelector('.btn-complete').addEventListener('click', () => toggleComplete(task.id));
    card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(task));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

    return card;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const urgent = tasks.filter(t => t.priority === 'Urgent' && !t.completed).length;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    urgentCount.textContent = urgent;
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

function getCategoryIcon(category) {
    const icons = {
        'Work': '💼',
        'Personal': '👤',
        'Shopping': '🛒',
        'Health': '💪',
        'Learning': '📚'
    };
    return icons[category] || '📋';
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
    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }

    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }

    // Escape: Close modal
    if (e.key === 'Escape' && taskModal.style.display === 'block') {
        closeModal();
    }
}
