const API_URL = 'http://localhost:3010/api/workouts';

let allWorkouts = [];
let editingWorkoutId = null;
let deletingWorkoutId = null;
let currentTab = 'log';

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    muscleGroupFilter: document.getElementById('muscleGroupFilter'),
    addWorkoutBtn: document.getElementById('addWorkoutBtn'),
    exerciseList: document.getElementById('exerciseList'),
    historyTab: document.getElementById('historyTab'),
    historyList: document.getElementById('historyList'),
    historyStartDate: document.getElementById('historyStartDate'),
    historyEndDate: document.getElementById('historyEndDate'),
    filterHistoryBtn: document.getElementById('filterHistoryBtn'),
    statsTab: document.getElementById('statsTab'),
    totalWorkouts: document.getElementById('totalWorkouts'),
    totalExercises: document.getElementById('totalExercises'),
    totalSets: document.getElementById('totalSets'),
    totalReps: document.getElementById('totalReps'),
    totalVolume: document.getElementById('totalVolume'),
    thisWeekWorkouts: document.getElementById('thisWeekWorkouts'),
    topExercises: document.getElementById('topExercises'),
    muscleChart: document.getElementById('muscleChart'),
    recentActivity: document.getElementById('recentActivity'),
    workoutModal: document.getElementById('workoutModal'),
    workoutForm: document.getElementById('workoutForm'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    submitBtn: document.getElementById('submitBtn'),
    workoutId: document.getElementById('workoutId'),
    exerciseName: document.getElementById('exerciseName'),
    muscleGroup: document.getElementById('muscleGroup'),
    sets: document.getElementById('sets'),
    reps: document.getElementById('reps'),
    weight: document.getElementById('weight'),
    workoutDate: document.getElementById('workoutDate'),
    workoutNotes: document.getElementById('workoutNotes'),
    nameError: document.getElementById('nameError'),
    setsError: document.getElementById('setsError'),
    repsError: document.getElementById('repsError'),
    dateError: document.getElementById('dateError'),
    volumePreview: document.getElementById('volumePreview'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    closeDeleteModal: document.getElementById('closeDeleteModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize
async function init() {
    await loadWorkouts();
    setupEventListeners();
    setDefaultDate();
    setupVolumePreview();
}

async function loadWorkouts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load workouts');
        allWorkouts = await response.json();
        renderExercises();
        renderHistory();
        updateStats();
    } catch (error) {
        showToast('Failed to load workouts', 'error');
        console.error(error);
    }
}

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    elements.searchBtn.addEventListener('click', filterExercises);
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterExercises();
        if (elements.searchInput.value === '') filterExercises();
    });
    elements.muscleGroupFilter.addEventListener('change', filterExercises);
    elements.addWorkoutBtn.addEventListener('click', openAddModal);
    elements.closeModal.addEventListener('click', closeAddModal);
    elements.cancelBtn.addEventListener('click', closeAddModal);
    elements.workoutForm.addEventListener('submit', handleFormSubmit);
    elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
    elements.filterHistoryBtn.addEventListener('click', renderHistory);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeDeleteModal();
        }
    });

    elements.workoutModal.addEventListener('click', (e) => {
        if (e.target === elements.workoutModal) closeAddModal();
    });
    elements.deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteConfirmModal) closeDeleteModal();
    });
}

function setupVolumePreview() {
    ['sets', 'reps', 'weight'].forEach(id => {
        elements[id].addEventListener('input', updateVolumePreview);
    });
}

function updateVolumePreview() {
    const sets = parseInt(elements.sets.value) || 0;
    const reps = parseInt(elements.reps.value) || 0;
    const weight = parseFloat(elements.weight.value) || 0;
    const volume = sets * reps * weight;
    elements.volumePreview.textContent = volume.toLocaleString() + ' kg';
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tab + 'Tab');
    });

    if (tab === 'stats') updateStats();
    if (tab === 'history') renderHistory();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.workoutDate.value = today;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    elements.historyStartDate.value = weekAgo.toISOString().split('T')[0];
    elements.historyEndDate.value = today;
}

function filterExercises() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const muscleGroup = elements.muscleGroupFilter.value;

    let filtered = allWorkouts.filter(workout => {
        const matchesSearch = !searchTerm ||
            workout.exerciseName.toLowerCase().includes(searchTerm);
        const matchesMuscle = !muscleGroup || workout.muscleGroup === muscleGroup;
        return matchesSearch && matchesMuscle;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderExerciseList(filtered);
}

function renderExercises() {
    const sorted = [...allWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderExerciseList(sorted);
}

function renderExerciseList(workouts) {
    if (workouts.length === 0) {
        elements.exerciseList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6.5 6.5h11M6.5 17.5h11M3 12h1m16 0h1M6 3v18M18 3v18"></path>
                </svg>
                <h3>No workouts found</h3>
                <p>Try adjusting your filters or log a new workout</p>
            </div>
        `;
        return;
    }

    elements.exerciseList.innerHTML = workouts.map(workout => {
        const volume = workout.sets * workout.reps * (workout.weight || 0);
        const muscleBadgeClass = workout.muscleGroup === 'Full Body' ? 'Full' : workout.muscleGroup;
        const formattedDate = formatDate(workout.date);

        return `
            <div class="exercise-card" data-id="${workout.id}">
                <div class="exercise-info">
                    <div class="exercise-name">${escapeHtml(workout.exerciseName)}</div>
                    <div class="exercise-meta">
                        <span>${formattedDate}</span>
                        ${workout.muscleGroup ? '<span class="muscle-badge ' + muscleBadgeClass + '">' + workout.muscleGroup + '</span>' : ''}
                    </div>
                </div>
                <div class="exercise-stats">
                    <div class="exercise-stat">
                        <span class="exercise-stat-value">${workout.sets}</span>
                        <span class="exercise-stat-label">Sets</span>
                    </div>
                    <div class="exercise-stat">
                        <span class="exercise-stat-value">${workout.reps}</span>
                        <span class="exercise-stat-label">Reps</span>
                    </div>
                    <div class="exercise-stat">
                        <span class="exercise-stat-value">${workout.weight ? workout.weight + 'kg' : 'BW'}</span>
                        <span class="exercise-stat-label">Weight</span>
                    </div>
                    <div class="exercise-stat">
                        <span class="exercise-stat-value">${volume.toLocaleString()}</span>
                        <span class="exercise-stat-label">Volume</span>
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="icon-btn edit" data-id="${workout.id}" aria-label="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn delete" data-id="${workout.id}" aria-label="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.icon-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(btn.dataset.id);
        });
    });

    document.querySelectorAll('.icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteModal(btn.dataset.id);
        });
    });
}

function renderHistory() {
    const startDate = elements.historyStartDate.value;
    const endDate = elements.historyEndDate.value;

    let filtered = [...allWorkouts];

    if (startDate) {
        filtered = filtered.filter(w => w.date >= startDate);
    }
    if (endDate) {
        filtered = filtered.filter(w => w.date <= endDate);
    }

    filtered.sort((a, b) => new Date(b.date + 'T' + (b.createdAt || '00:00:00')) - new Date(a.date + 'T' + (a.createdAt || '00:00:00')));

    if (filtered.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <h3>No workouts in this period</h3>
                <p>Try adjusting the date range or log some workouts</p>
            </div>
        `;
        return;
    }

    const grouped = {};
    filtered.forEach(workout => {
        if (!grouped[workout.date]) {
            grouped[workout.date] = [];
        }
        grouped[workout.date].push(workout);
    });

    let html = '';
    Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        const formattedDate = formatDate(date);
        html += `<div class="history-group">
            <div class="history-date-header">${formattedDate}</div>`;

        grouped[date].forEach(workout => {
            const volume = workout.sets * workout.reps * (workout.weight || 0);
            html += `
                <div class="history-entry">
                    <div>
                        <div class="history-exercise">${escapeHtml(workout.exerciseName)}</div>
                        ${workout.muscleGroup ? '<span class="muscle-badge ' + (workout.muscleGroup === 'Full Body' ? 'Full' : workout.muscleGroup) + '" style="font-size:0.7rem;padding:2px 8px;">' + workout.muscleGroup + '</span>' : ''}
                    </div>
                    <div class="history-details">
                        ${workout.sets} sets x ${workout.reps} reps ${workout.weight ? '@ ' + workout.weight + 'kg' : '(bodyweight')}
                        ${workout.workoutNotes ? ' - ' + escapeHtml(workout.workoutNotes) : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
    });

    elements.historyList.innerHTML = html;
}

function updateStats() {
    const total = allWorkouts.length;
    const uniqueExercises = [...new Set(allWorkouts.map(w => w.exerciseName.toLowerCase()))].length;
    const totalSets = allWorkouts.reduce((sum, w) => sum + w.sets, 0);
    const totalReps = allWorkouts.reduce((sum, w) => sum + (w.sets * w.reps), 0);
    const totalVolume = allWorkouts.reduce((sum, w) => sum + (w.sets * w.reps * (w.weight || 0)), 0);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekCount = allWorkouts.filter(w => new Date(w.date) >= startOfWeek).length;

    elements.totalWorkouts.textContent = total;
    elements.totalExercises.textContent = uniqueExercises;
    elements.totalSets.textContent = totalSets.toLocaleString();
    elements.totalReps.textContent = totalReps.toLocaleString();
    elements.totalVolume.textContent = totalVolume.toLocaleString();
    elements.thisWeekWorkouts.textContent = thisWeekCount;

    renderTopExercises();
    renderMuscleChart();
    renderRecentActivity();
}

function renderTopExercises() {
    const exerciseVolumes = {};
    allWorkouts.forEach(w => {
        const name = w.exerciseName.toLowerCase();
        const volume = w.sets * w.reps * (w.weight || 0);
        if (!exerciseVolumes[name]) {
            exerciseVolumes[name] = { name: w.exerciseName, volume: 0 };
        }
        exerciseVolumes[name].volume += volume;
    });

    const sorted = Object.values(exerciseVolumes).sort((a, b) => b.volume - a.volume).slice(0, 5);
    const maxVolume = sorted.length > 0 ? sorted[0].volume : 1;

    if (sorted.length === 0) {
        elements.topExercises.innerHTML = '<p style="color:var(--text-muted)">No data yet</p>';
        return;
    }

    elements.topExercises.innerHTML = sorted.map(ex => {
        const percentage = (ex.volume / maxVolume) * 100;
        return `
            <div class="top-exercise-item">
                <span class="top-exercise-name">${escapeHtml(ex.name)}</span>
                <div class="top-exercise-bar">
                    <div class="top-exercise-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="top-exercise-volume">${ex.volume.toLocaleString()} kg</span>
            </div>
        `;
    }).join('');
}

function renderMuscleChart() {
    const muscleCounts = {};
    const muscleColors = {
        Chest: '#f2994a',
        Back: '#6c5ce7',
        Shoulders: '#00cec9',
        Arms: '#fd79a8',
        Legs: '#00b894',
        Core: '#e17055',
        'Full Body': '#74b9ff'
    };

    allWorkouts.forEach(w => {
        if (w.muscleGroup) {
            muscleCounts[w.muscleGroup] = (muscleCounts[w.muscleGroup] || 0) + 1;
        }
    });

    const total = allWorkouts.length || 1;

    if (Object.keys(muscleCounts).length === 0) {
        elements.muscleChart.innerHTML = '<p style="color:var(--text-muted)">No data yet</p>';
        return;
    }

    elements.muscleChart.innerHTML = Object.entries(muscleCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([muscle, count]) => {
            const percentage = Math.round((count / total) * 100);
            const color = muscleColors[muscle] || '#74b9ff';
            return `
                <div class="muscle-item">
                    <div class="muscle-circle" style="background: ${color}20; color: ${color}; border: 2px solid ${color}">
                        ${percentage}%
                    </div>
                    <div class="muscle-name">${muscle}</div>
                </div>
            `;
        }).join('');
}

function renderRecentActivity() {
    const recent = [...allWorkouts]
        .sort((a, b) => new Date(b.date + 'T' + (b.createdAt || '00:00:00')) - new Date(a.date + 'T' + (a.createdAt || '00:00:00')))
        .slice(0, 5);

    if (recent.length === 0) {
        elements.recentActivity.innerHTML = '<p style="color:var(--text-muted)">No activity yet</p>';
        return;
    }

    elements.recentActivity.innerHTML = recent.map(w => `
        <div class="activity-item">
            <span class="activity-exercise">${escapeHtml(w.exerciseName)}</span>
            <span>${w.sets}x${w.reps} ${w.weight ? '@ ' + w.weight + 'kg' : ''}</span>
            <span class="activity-date">${formatDate(w.date)}</span>
        </div>
    `).join('');
}

function openAddModal() {
    editingWorkoutId = null;
    elements.modalTitle.textContent = 'Log Workout';
    elements.workoutForm.reset();
    elements.workoutId.value = '';
    setDefaultDate();
    elements.nameError.textContent = '';
    elements.setsError.textContent = '';
    elements.repsError.textContent = '';
    elements.dateError.textContent = '';
    elements.volumePreview.textContent = '0 kg';
    elements.workoutModal.classList.remove('hidden');
    elements.exerciseName.focus();
}

function openEditModal(workoutId) {
    const workout = allWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    editingWorkoutId = workoutId;
    elements.modalTitle.textContent = 'Edit Workout';
    elements.workoutId.value = workout.id;
    elements.exerciseName.value = workout.exerciseName;
    elements.muscleGroup.value = workout.muscleGroup || '';
    elements.sets.value = workout.sets;
    elements.reps.value = workout.reps;
    elements.weight.value = workout.weight || '';
    elements.workoutDate.value = workout.date;
    elements.workoutNotes.value = workout.workoutNotes || '';
    elements.nameError.textContent = '';
    elements.setsError.textContent = '';
    elements.repsError.textContent = '';
    elements.dateError.textContent = '';
    updateVolumePreview();
    elements.workoutModal.classList.remove('hidden');
}

function closeAddModal() {
    elements.workoutModal.classList.add('hidden');
    editingWorkoutId = null;
    elements.workoutForm.reset();
    setDefaultDate();
    elements.volumePreview.textContent = '0 kg';
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const workoutData = {
        exerciseName: elements.exerciseName.value.trim(),
        muscleGroup: elements.muscleGroup.value,
        sets: parseInt(elements.sets.value),
        reps: parseInt(elements.reps.value),
        weight: parseFloat(elements.weight.value) || 0,
        date: elements.workoutDate.value,
        workoutNotes: elements.workoutNotes.value.trim()
    };

    try {
        let response;
        if (editingWorkoutId) {
            response = await fetch(`${API_URL}/${editingWorkoutId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutData)
            });
            if (!response.ok) throw new Error('Failed to update workout');
            showToast('Workout updated successfully', 'success');
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutData)
            });
            if (!response.ok) throw new Error('Failed to create workout');
            showToast('Workout logged successfully', 'success');
        }

        await loadWorkouts();
        closeAddModal();
    } catch (error) {
        showToast('Failed to save workout', 'error');
        console.error(error);
    }
}

function validateForm() {
    let valid = true;
    elements.nameError.textContent = '';
    elements.setsError.textContent = '';
    elements.repsError.textContent = '';
    elements.dateError.textContent = '';
    elements.exerciseName.classList.remove('invalid');
    elements.sets.classList.remove('invalid');
    elements.reps.classList.remove('invalid');
    elements.workoutDate.classList.remove('invalid');

    const name = elements.exerciseName.value.trim();
    if (!name || name.length < 2) {
        elements.nameError.textContent = 'Exercise name must be at least 2 characters';
        elements.exerciseName.classList.add('invalid');
        valid = false;
    }

    const sets = parseInt(elements.sets.value);
    if (!sets || sets < 1) {
        elements.setsError.textContent = 'Sets must be at least 1';
        elements.sets.classList.add('invalid');
        valid = false;
    }

    const reps = parseInt(elements.reps.value);
    if (!reps || reps < 1) {
        elements.repsError.textContent = 'Reps must be at least 1';
        elements.reps.classList.add('invalid');
        valid = false;
    }

    if (!elements.workoutDate.value) {
        elements.dateError.textContent = 'Date is required';
        elements.workoutDate.classList.add('invalid');
        valid = false;
    }

    return valid;
}

function openDeleteModal(workoutId) {
    deletingWorkoutId = workoutId;
    elements.deleteConfirmModal.classList.remove('hidden');
}

function closeDeleteModal() {
    elements.deleteConfirmModal.classList.add('hidden');
    deletingWorkoutId = null;
}

async function confirmDelete() {
    if (!deletingWorkoutId) return;

    try {
        const response = await fetch(`${API_URL}/${deletingWorkoutId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete workout');

        showToast('Workout deleted successfully', 'success');
        await loadWorkouts();
        closeDeleteModal();
    } catch (error) {
        showToast('Failed to delete workout', 'error');
        console.error(error);
    }
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

function formatDate(dateStr) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
