// DOM Elements
const habitsContainer = document.getElementById('habitsContainer');
const searchInput = document.getElementById('searchInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitModal = document.getElementById('habitModal');
const heatmapModal = document.getElementById('heatmapModal');
const modalTitle = document.getElementById('modalTitle');
const heatmapTitle = document.getElementById('heatmapTitle');
const habitForm = document.getElementById('habitForm');
const habitNameInput = document.getElementById('habitName');
const habitCategory = document.getElementById('habitCategory');
const habitDescription = document.getElementById('habitDescription');
const habitTarget = document.getElementById('habitTarget');
const habitReminder = document.getElementById('habitReminder');
const nameError = document.getElementById('nameError');
const cancelBtn = document.getElementById('cancelBtn');
const modalCloseBtns = document.querySelectorAll('.modal-close');
const modalOverlays = document.querySelectorAll('.modal-overlay');
const heatmapContainer = document.getElementById('heatmapContainer');
const milestonesContainer = document.getElementById('milestonesContainer');
const currentStreakValue = document.getElementById('currentStreakValue');
const longestStreakValue = document.getElementById('longestStreakValue');

// Stats elements
const totalHabitsEl = document.getElementById('totalHabits');
const activeStreaksEl = document.getElementById('activeStreaks');
const bestStreakEl = document.getElementById('bestStreak');
const todayCompletedEl = document.getElementById('todayCompleted');

let habits = [];
let editingHabitId = null;
let currentFilter = 'all';

// ===== LOAD & DISPLAY HABITS =====
async function loadHabits() {
    try {
        showLoading();

        const response = await fetch('/api/habits');

        if (!response.ok) {
            throw new Error(`Failed to fetch habits (${response.status})`);
        }

        // Check if response has content before parsing
        const text = await response.text();
        if (!text || text.trim().length === 0) {
            console.warn('Empty response from server, using empty array');
            habits = [];
        } else {
            habits = JSON.parse(text);
        }

        if (!Array.isArray(habits)) {
            throw new Error('Invalid data format from server');
        }

        console.log('✓ Loaded', habits.length, 'habits from server');
        displayHabits();
        updateStats();
    } catch (error) {
        console.error('❌ Error loading habits:', error);
        showToast('Failed to load habits. Please refresh the page.', 'error');
        habits = [];
        displayHabits();
        updateStats();
    } finally {
        hideLoading();
    }
}

function displayHabits() {
    habitsContainer.innerHTML = '';

    let filteredHabits = filterHabits();

    if (filteredHabits.length === 0) {
        const hasAnyHabits = habits.length === 0;
        habitsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${hasAnyHabits ? '🎯' : '🔍'}</div>
                <div class="empty-title">${hasAnyHabits ? 'No Habits Yet' : 'No Habits Found'}</div>
                <div class="empty-description">${hasAnyHabits ? 'Start building positive habits today!' : 'Try a different search or filter.'}</div>
                ${hasAnyHabits ? '<button class="btn btn-add" onclick="openAddModal()"><span class="icon">+</span> Add Your First Habit</button>' : ''}
            </div>
        `;
        return;
    }

    filteredHabits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

// ===== FILTER HABITS =====
function filterHabits() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const today = new Date().toISOString().split('T')[0];
    
    let filtered = habits;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(habit =>
            habit.name.toLowerCase().includes(searchTerm) ||
            habit.category.toLowerCase().includes(searchTerm) ||
            (habit.description && habit.description.toLowerCase().includes(searchTerm))
        );
    }

    // Apply status filter
    if (currentFilter === 'active') {
        filtered = filtered.filter(habit => habit.streak > 0);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(habit => 
            habit.completedDates && habit.completedDates.includes(today)
        );
    } else if (currentFilter === 'missed') {
        filtered = filtered.filter(habit => 
            !habit.completedDates || !habit.completedDates.includes(today)
        );
    }

    return filtered;
}

// ===== CREATE HABIT CARD =====
function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates && habit.completedDates.includes(today);
    
    if (isCompletedToday) {
        card.classList.add('completed');
    } else if (habit.streak > 0) {
        card.classList.add('missed');
    }

    const progress = Math.min(((habit.currentProgress || 0) / (habit.target || 1)) * 100, 100);
    const categoryEmojis = {
        health: '🏃', learning: '📚', productivity: '💼', 
        mindfulness: '🧘', social: '👥', creative: '🎨', 
        finance: '💰', other: '📌'
    };

    card.innerHTML = `
        <div class="habit-header">
            <div class="habit-title">
                <div>
                    <div class="habit-name">${escapeHtml(habit.name)}</div>
                    <span class="habit-category">${categoryEmojis[habit.category] || '📌'} ${habit.category}</span>
                </div>
                <div class="habit-streak">
                    🔥 ${habit.streak || 0}
                </div>
            </div>
        </div>
        
        ${habit.description ? `<div class="habit-description">${escapeHtml(habit.description)}</div>` : ''}
        
        <div class="habit-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">
                <span>${habit.currentProgress || 0}/${habit.target || 1} today</span>
                <span>${Math.round(progress)}%</span>
            </div>
        </div>

        <div class="habit-actions">
            <button class="btn btn-complete ${isCompletedToday ? 'completed' : ''}" 
                    data-id="${habit.id}" 
                    ${isCompletedToday ? 'disabled' : ''}>
                ${isCompletedToday ? '✅ Done Today' : '✓ Mark Complete'}
            </button>
            <button class="btn btn-view" data-id="${habit.id}">📊 View Progress</button>
        </div>

        <div class="habit-secondary-actions">
            <button class="btn btn-edit" data-id="${habit.id}">✎ Edit</button>
            <button class="btn btn-delete" data-id="${habit.id}">🗑 Delete</button>
        </div>
    `;

    // Add event listeners
    const completeBtn = card.querySelector('.btn-complete');
    const viewBtn = card.querySelector('.btn-view');
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');

    if (!isCompletedToday) {
        completeBtn.addEventListener('click', () => completeHabit(habit.id));
    }
    viewBtn.addEventListener('click', () => openHeatmap(habit));
    editBtn.addEventListener('click', () => openEditModal(habit));
    deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

    return card;
}

// ===== COMPLETE HABIT =====
async function completeHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) {
        showToast('Habit not found', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentProgress = (habit.currentProgress || 0) + 1;

    try {
        console.log('Completing habit:', id);

        const response = await fetch(`/api/habits/${id}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                today: today,
                currentProgress: currentProgress,
                target: habit.target || 1
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Server error: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // If error response is not valid JSON, use status message
            }
            throw new Error(errorMessage);
        }

        // Get response text first to validate
        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from server');
        }
        
        const result = JSON.parse(text);
        console.log('✓ Habit completed:', result);

        if (result.streak > 0 && result.streak % 7 === 0) {
            showToast(`🎉 Amazing! ${result.streak} day streak!`, 'success');
        } else {
            showToast(`✓ Habit completed! ${result.streak} day streak!`, 'success');
        }

        await loadHabits();
    } catch (error) {
        console.error('❌ Error completing habit:', error);
        showToast(error.message || 'Failed to complete habit. Please try again.', 'error');
    }
}

// ===== UPDATE STATS =====
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    totalHabitsEl.textContent = habits.length;
    
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    activeStreaksEl.textContent = activeStreaks;
    
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
    bestStreakEl.textContent = bestStreak;
    
    const todayCompleted = habits.filter(h => 
        h.completedDates && h.completedDates.includes(today)
    ).length;
    todayCompletedEl.textContent = todayCompleted;
}

// ===== MODAL FUNCTIONS =====
function openAddModal() {
    editingHabitId = null;
    modalTitle.textContent = 'Add New Habit';
    habitForm.reset();
    nameError.textContent = '';
    habitModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => habitNameInput.focus(), 100);
}

function openEditModal(habit) {
    editingHabitId = habit.id;
    modalTitle.textContent = 'Edit Habit';
    habitNameInput.value = habit.name;
    habitCategory.value = habit.category || 'other';
    habitDescription.value = habit.description || '';
    habitTarget.value = habit.target || 1;
    habitReminder.value = habit.reminder || '';
    nameError.textContent = '';
    habitModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => habitNameInput.focus(), 100);
}

function closeModal() {
    habitModal.style.display = 'none';
    habitForm.reset();
    editingHabitId = null;
    nameError.textContent = '';
    document.body.style.overflow = '';
}

// ===== HEATMAP & MILESTONES =====
function openHeatmap(habit) {
    heatmapTitle.textContent = `${habit.name} - Progress`;
    generateHeatmap(habit);
    generateMilestones(habit);
    currentStreakValue.textContent = `${habit.streak || 0} days`;
    longestStreakValue.textContent = `${habit.longestStreak || 0} days`;
    heatmapModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeHeatmap() {
    heatmapModal.style.display = 'none';
    document.body.style.overflow = '';
}

function generateHeatmap(habit) {
    heatmapContainer.innerHTML = '';
    
    const completedDates = habit.completedDates || [];
    const today = new Date();
    const days = [];
    
    // Generate last 60 days
    for (let i = 59; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const isCompleted = completedDates.includes(dateStr);
        days.push({ date: dateStr, isCompleted });
    }
    
    // Create heatmap grid
    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';
    
    // Add day headers
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'heatmap-header';
        header.textContent = day;
        heatmapGrid.appendChild(header);
    });
    
    // Add day cells
    days.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        if (day.isCompleted) {
            cell.classList.add('completed');
        }
        cell.title = `${day.date}: ${day.isCompleted ? '✓ Completed' : '○ Missed'}`;
        heatmapGrid.appendChild(cell);
    });
    
    heatmapContainer.appendChild(heatmapGrid);
}

function generateMilestones(habit) {
    const milestones = [
        { days: 1, icon: '🌱', title: 'First Step', desc: 'Completed your first day!' },
        { days: 3, icon: '🔥', title: 'Getting Started', desc: '3-day streak!' },
        { days: 7, icon: '⭐', title: 'Week Warrior', desc: 'One week complete!' },
        { days: 14, icon: '💪', title: 'Two Weeks', desc: '14-day streak!' },
        { days: 21, icon: '🎯', title: 'Habit Formed', desc: '21 days - It\'s a habit!' },
        { days: 30, icon: '🏆', title: 'Monthly Master', desc: '30 days - Amazing!' },
        { days: 60, icon: '👑', title: 'Champion', desc: '60 days - Incredible!' },
        { days: 90, icon: '🚀', title: 'Legendary', desc: '90 days - Unstoppable!' },
    ];
    
    const longestStreak = habit.longestStreak || habit.streak || 0;
    
    milestonesContainer.innerHTML = milestones.map(milestone => {
        const achieved = longestStreak >= milestone.days;
        return `
            <div class="milestone-item ${achieved ? 'achieved' : ''}">
                <div class="milestone-icon">${milestone.icon}</div>
                <div class="milestone-title">${milestone.title} ${achieved ? '✓' : ''}</div>
                <div class="milestone-desc">${milestone.desc}</div>
            </div>
        `;
    }).join('');
}

// ===== FORM SUBMISSION (FIXED) =====
habitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Form submitted, editingId:', editingHabitId);

    const name = habitNameInput.value.trim();
    const category = habitCategory.value;
    const description = habitDescription.value.trim();
    const target = parseInt(habitTarget.value) || 1;
    const reminder = habitReminder.value;

    console.log('Form data:', { name, category, description, target, reminder });

    // Validation
    if (!name) {
        nameError.textContent = 'Habit name is required';
        habitNameInput.focus();
        return;
    }

    if (name.length < 2) {
        nameError.textContent = 'Name must be at least 2 characters';
        habitNameInput.focus();
        return;
    }

    if (target < 1 || target > 100) {
        showToast('Target must be between 1 and 100', 'error');
        return;
    }

    try {
        if (editingHabitId) {
            console.log('Updating habit:', editingHabitId);
            await updateHabit(editingHabitId, { name, category, description, target, reminder });
            showToast('✓ Habit updated successfully!', 'success');
        } else {
            console.log('Adding new habit...');
            const habitData = { name, category, description, target, reminder };
            console.log('Sending to server:', JSON.stringify(habitData));
            
            await addHabit(habitData);
            showToast('✓ Habit created successfully!', 'success');
        }
        
        closeModal();
        await loadHabits();
    } catch (error) {
        console.error('❌ Error saving habit:', error);
        showToast('Error: ' + error.message, 'error');
    }
});

// ===== API FUNCTIONS (FIXED & SIMPLIFIED) =====
async function addHabit(habitData) {
    console.log('→ POST /api/habits', habitData);

    const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
    });

    console.log('← Response status:', response.status);

    // Get response text first to validate
    const text = await response.text();
    console.log('← Response text:', text);
    
    if (!text || text.trim().length === 0) {
        throw new Error('Empty response from server');
    }
    
    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || 'Failed to add habit');
    }

    return result;
}

async function updateHabit(id, habitData) {
    console.log('→ PUT /api/habits/' + id, habitData);

    const response = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
    });

    // Get response text first to validate
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
        throw new Error('Empty response from server');
    }
    
    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || 'Failed to update habit');
    }

    return result;
}

async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        return;
    }

    try {
        console.log('→ DELETE /api/habits/' + id);

        const response = await fetch(`/api/habits/${id}`, {
            method: 'DELETE',
        });

        // Get response text first to validate
        const text = await response.text();
        
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from server');
        }
        
        const result = JSON.parse(text);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete habit');
        }

        console.log('← Habit deleted:', result);
        showToast('✓ Habit deleted successfully!', 'success');
        await loadHabits();
    } catch (error) {
        console.error('❌ Error deleting habit:', error);
        showToast('Failed to delete habit. Please try again.', 'error');
    }
}

// ===== SEARCH & FILTER =====
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        displayHabits();
    }, 200);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        displayHabits();
    });
});

// ===== MODAL CLOSE EVENTS =====
addHabitBtn.addEventListener('click', () => openAddModal());
cancelBtn.addEventListener('click', () => closeModal());

modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal();
        closeHeatmap();
    });
});

modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
            closeHeatmap();
        }
    });
});

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    habitsContainer.innerHTML = '<div class="loading">Loading habits</div>';
}

function hideLoading() {
    const loadingEl = habitsContainer.querySelector('.loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    console.log('Toast:', type, message);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N to add new habit
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
        closeHeatmap();
    }
});

// ===== INITIALIZATION =====
console.log('🔥 Habit Streak Tracker - Initializing...');
console.log('Server URL:', window.location.href);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, loading habits...');
    loadHabits();
});
