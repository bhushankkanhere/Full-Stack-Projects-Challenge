const API_URL = 'http://localhost:3008/api/events';

let allEvents = [];
let currentView = 'list';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let editingEventId = null;
let deletingEventId = null;
let selectedDetailEventId = null;

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    statusFilter: document.getElementById('statusFilter'),
    addEventBtn: document.getElementById('addEventBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    calendarViewBtn: document.getElementById('calendarViewBtn'),
    eventsList: document.getElementById('eventsList'),
    listView: document.getElementById('listView'),
    calendarView: document.getElementById('calendarView'),
    calendarMonth: document.getElementById('calendarMonth'),
    calendarDays: document.getElementById('calendarDays'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    eventModal: document.getElementById('eventModal'),
    eventForm: document.getElementById('eventForm'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    submitBtn: document.getElementById('submitBtn'),
    eventId: document.getElementById('eventId'),
    eventTitle: document.getElementById('eventTitle'),
    eventDescription: document.getElementById('eventDescription'),
    eventDate: document.getElementById('eventDate'),
    eventTime: document.getElementById('eventTime'),
    eventEndDate: document.getElementById('eventEndDate'),
    eventEndTime: document.getElementById('eventEndTime'),
    eventCategory: document.getElementById('eventCategory'),
    eventLocation: document.getElementById('eventLocation'),
    conflictWarning: document.getElementById('conflictWarning'),
    conflictText: document.getElementById('conflictText'),
    titleError: document.getElementById('titleError'),
    eventDetailModal: document.getElementById('eventDetailModal'),
    closeDetailModal: document.getElementById('closeDetailModal'),
    detailTitle: document.getElementById('detailTitle'),
    detailDateTime: document.getElementById('detailDateTime'),
    detailCategory: document.getElementById('detailCategory'),
    detailLocation: document.getElementById('detailLocation'),
    detailLocationItem: document.getElementById('detailLocationItem'),
    detailDescription: document.getElementById('detailDescription'),
    detailDescItem: document.getElementById('detailDescItem'),
    editEventBtn: document.getElementById('editEventBtn'),
    deleteEventBtn: document.getElementById('deleteEventBtn'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    closeDeleteModal: document.getElementById('closeDeleteModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    toastContainer: document.getElementById('toastContainer'),
    totalEvents: document.getElementById('totalEvents'),
    todayEvents: document.getElementById('todayEvents'),
    upcomingEvents: document.getElementById('upcomingEvents'),
    pastEvents: document.getElementById('pastEvents')
};

// Initialize
async function init() {
    await loadEvents();
    setupEventListeners();
    setDefaultDate();
}

async function loadEvents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load events');
        allEvents = await response.json();
        renderEvents();
        updateStats();
        renderCalendar();
    } catch (error) {
        showToast('Failed to load events', 'error');
        console.error(error);
    }
}

function setupEventListeners() {
    elements.searchBtn.addEventListener('click', filterEvents);
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterEvents();
        if (elements.searchInput.value === '') filterEvents();
    });
    elements.categoryFilter.addEventListener('change', filterEvents);
    elements.statusFilter.addEventListener('change', filterEvents);
    elements.addEventBtn.addEventListener('click', openAddModal);
    elements.listViewBtn.addEventListener('click', () => switchView('list'));
    elements.calendarViewBtn.addEventListener('click', () => switchView('calendar'));
    elements.closeModal.addEventListener('click', closeAddModal);
    elements.cancelBtn.addEventListener('click', closeAddModal);
    elements.eventForm.addEventListener('submit', handleFormSubmit);
    elements.closeDetailModal.addEventListener('click', closeDetailModal);
    elements.editEventBtn.addEventListener('click', editEventFromDetail);
    elements.deleteEventBtn.addEventListener('click', openDeleteModal);
    elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
    elements.prevMonth.addEventListener('click', () => changeMonth(-1));
    elements.nextMonth.addEventListener('click', () => changeMonth(1));
    elements.eventDate.addEventListener('change', checkConflicts);
    elements.eventTime.addEventListener('change', checkConflicts);
    elements.eventEndDate.addEventListener('change', checkConflicts);
    elements.eventEndTime.addEventListener('change', checkConflicts);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeDetailModal();
            closeDeleteModal();
        }
    });

    elements.eventModal.addEventListener('click', (e) => {
        if (e.target === elements.eventModal) closeAddModal();
    });
    elements.eventDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.eventDetailModal) closeDetailModal();
    });
    elements.deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteConfirmModal) closeDeleteModal();
    });
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.eventDate.value = today;
    elements.eventEndDate.value = today;
}

function switchView(view) {
    currentView = view;
    elements.listViewBtn.classList.toggle('active', view === 'list');
    elements.calendarViewBtn.classList.toggle('active', view === 'calendar');
    elements.listView.classList.toggle('hidden', view !== 'list');
    elements.calendarView.classList.toggle('hidden', view !== 'calendar');
    if (view === 'calendar') renderCalendar();
}

function filterEvents() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const category = elements.categoryFilter.value;
    const status = elements.statusFilter.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = allEvents.filter(event => {
        const matchesSearch = !searchTerm ||
            event.title.toLowerCase().includes(searchTerm) ||
            (event.description && event.description.toLowerCase().includes(searchTerm)) ||
            (event.location && event.location.toLowerCase().includes(searchTerm));

        const matchesCategory = !category || event.category === category;

        const eventDate = new Date(event.date + 'T' + event.time);
        let matchesStatus = true;
        if (status === 'today') {
            const eventDay = new Date(event.date);
            eventDay.setHours(0, 0, 0, 0);
            matchesStatus = eventDay.getTime() === today.getTime();
        } else if (status === 'upcoming') {
            matchesStatus = eventDate > today;
        } else if (status === 'past') {
            matchesStatus = eventDate <= today;
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    renderEventList(filtered);
}

function renderEvents() {
    const sorted = [...allEvents].sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    renderEventList(sorted);
}

function renderEventList(events) {
    if (events.length === 0) {
        elements.eventsList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3>No events found</h3>
                <p>Try adjusting your filters or add a new event</p>
            </div>
        `;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    elements.eventsList.innerHTML = events.map(event => {
        const eventDate = new Date(event.date + 'T' + event.time);
        const isPast = eventDate < today;
        const formattedDate = formatDate(event.date);
        const formattedTime = formatTime(event.time);

        let endTimeStr = '';
        if (event.endTime) {
            endTimeStr = ' - ' + formatTime(event.endTime);
        }

        return `
            <div class="event-card category-${event.category} ${isPast ? 'past' : ''}" data-id="${event.id}">
                <div class="event-header">
                    <span class="event-title">${escapeHtml(event.title)}</span>
                    <span class="event-category-badge ${event.category}">${event.category}</span>
                </div>
                <div class="event-meta">
                    <span>${formattedDate}</span>
                    <span>${formattedTime}${endTimeStr}</span>
                    ${event.location ? '<span>' + escapeHtml(event.location) + '</span>' : ''}
                </div>
                ${event.description ? '<div class="event-description">' + escapeHtml(event.description) + '</div>' : ''}
            </div>
        `;
    }).join('');

    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => openDetailModal(card.dataset.id));
    });
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    elements.calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let html = '';

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = allEvents.filter(e => e.date === dateStr);
        html += `<div class="calendar-day other-month" data-date="${dateStr}">
            <div class="calendar-day-number">${day}</div>
            ${dayEvents.slice(0, 2).map(e => `<div class="calendar-event ${e.category}" data-id="${e.id}">${escapeHtml(e.title)}</div>`).join('')}
        </div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const dayEvents = allEvents.filter(e => e.date === dateStr);
        html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
            <div class="calendar-day-number">${day}</div>
            ${dayEvents.slice(0, 3).map(e => `<div class="calendar-event ${e.category}" data-id="${e.id}">${escapeHtml(e.title)}</div>`).join('')}
            ${dayEvents.length > 3 ? `<div style="font-size:0.65rem;color:var(--text-muted)">+${dayEvents.length - 3} more</div>` : ''}
        </div>`;
    }

    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = allEvents.filter(e => e.date === dateStr);
        html += `<div class="calendar-day other-month" data-date="${dateStr}">
            <div class="calendar-day-number">${day}</div>
            ${dayEvents.slice(0, 2).map(e => `<div class="calendar-event ${e.category}" data-id="${e.id}">${escapeHtml(e.title)}</div>`).join('')}
        </div>`;
    }

    elements.calendarDays.innerHTML = html;

    document.querySelectorAll('.calendar-event').forEach(ev => {
        ev.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailModal(ev.dataset.id);
        });
    });

    document.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', () => {
            const dateStr = day.dataset.date;
            if (dateStr) {
                openAddModal(dateStr);
            }
        });
    });
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function openAddModal(dateStr) {
    editingEventId = null;
    elements.modalTitle.textContent = 'Add New Event';
    elements.eventForm.reset();
    elements.eventId.value = '';
    setDefaultDate();
    if (dateStr) {
        elements.eventDate.value = dateStr;
        elements.eventEndDate.value = dateStr;
    }
    elements.conflictWarning.classList.add('hidden');
    elements.titleError.textContent = '';
    elements.eventModal.classList.remove('hidden');
    elements.eventTitle.focus();
}

function openEditModal(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    editingEventId = eventId;
    elements.modalTitle.textContent = 'Edit Event';
    elements.eventId.value = event.id;
    elements.eventTitle.value = event.title;
    elements.eventDescription.value = event.description || '';
    elements.eventDate.value = event.date;
    elements.eventTime.value = event.time;
    elements.eventEndDate.value = event.endDate || event.date;
    elements.eventEndTime.value = event.endTime || '';
    elements.eventCategory.value = event.category;
    elements.eventLocation.value = event.location || '';
    elements.conflictWarning.classList.add('hidden');
    elements.titleError.textContent = '';
    elements.eventModal.classList.remove('hidden');
    closeDetailModal();
}

function closeAddModal() {
    elements.eventModal.classList.add('hidden');
    editingEventId = null;
    elements.eventForm.reset();
    setDefaultDate();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const eventData = {
        title: elements.eventTitle.value.trim(),
        description: elements.eventDescription.value.trim(),
        date: elements.eventDate.value,
        time: elements.eventTime.value,
        endDate: elements.eventEndDate.value || elements.eventDate.value,
        endTime: elements.eventEndTime.value,
        category: elements.eventCategory.value,
        location: elements.eventLocation.value.trim()
    };

    try {
        let response;
        if (editingEventId) {
            response = await fetch(`${API_URL}/${editingEventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (!response.ok) throw new Error('Failed to update event');
            showToast('Event updated successfully', 'success');
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (!response.ok) throw new Error('Failed to create event');
            showToast('Event created successfully', 'success');
        }

        await loadEvents();
        closeAddModal();
    } catch (error) {
        showToast('Failed to save event', 'error');
        console.error(error);
    }
}

function validateForm() {
    let valid = true;
    elements.titleError.textContent = '';
    elements.eventTitle.classList.remove('invalid');
    elements.eventDate.classList.remove('invalid');
    elements.eventTime.classList.remove('invalid');
    elements.eventCategory.classList.remove('invalid');

    const title = elements.eventTitle.value.trim();
    if (!title || title.length < 2) {
        elements.titleError.textContent = 'Title must be at least 2 characters';
        elements.eventTitle.classList.add('invalid');
        valid = false;
    }

    if (!elements.eventDate.value) {
        elements.eventDate.classList.add('invalid');
        valid = false;
    }

    if (!elements.eventTime.value) {
        elements.eventTime.classList.add('invalid');
        valid = false;
    }

    if (!elements.eventCategory.value) {
        elements.eventCategory.classList.add('invalid');
        valid = false;
    }

    if (elements.eventEndDate.value && elements.eventEndDate.value < elements.eventDate.value) {
        showToast('End date cannot be before start date', 'error');
        valid = false;
    }

    if (elements.eventEndDate.value === elements.eventDate.value && elements.eventEndTime.value && elements.eventTime.value) {
        if (elements.eventEndTime.value <= elements.eventTime.value) {
            showToast('End time must be after start time', 'error');
            valid = false;
        }
    }

    return valid;
}

function checkConflicts() {
    const date = elements.eventDate.value;
    const time = elements.eventTime.value;
    const endDate = elements.eventEndDate.value || date;
    const endTime = elements.eventEndTime.value;

    if (!date || !time) return;

    const eventStart = new Date(date + 'T' + time);
    const eventEnd = endTime ? new Date(endDate + 'T' + endTime) : new Date(eventStart.getTime() + 3600000);

    const conflicts = allEvents.filter(event => {
        if (editingEventId && event.id === editingEventId) return false;

        const compareStart = new Date(event.date + 'T' + event.time);
        const compareEnd = event.endTime ? new Date(event.endDate + 'T' + event.endTime) : new Date(compareStart.getTime() + 3600000);

        return eventStart < compareEnd && eventEnd > compareStart;
    });

    if (conflicts.length > 0) {
        elements.conflictWarning.classList.remove('hidden');
        elements.conflictText.textContent = `Time conflict with: ${conflicts.map(e => e.title).join(', ')}`;
    } else {
        elements.conflictWarning.classList.add('hidden');
    }
}

function openDetailModal(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    selectedDetailEventId = eventId;
    elements.detailTitle.textContent = event.title;

    let timeStr = formatDate(event.date) + ' at ' + formatTime(event.time);
    if (event.endTime) {
        timeStr += ' - ' + formatTime(event.endTime);
    }
    if (event.endDate && event.endDate !== event.date) {
        timeStr += ' to ' + formatDate(event.endDate);
    }
    elements.detailDateTime.textContent = timeStr;

    elements.detailCategory.innerHTML = `<span class="event-category-badge ${event.category}">${event.category}</span>`;

    if (event.location) {
        elements.detailLocationItem.classList.remove('hidden');
        elements.detailLocation.textContent = event.location;
    } else {
        elements.detailLocationItem.classList.add('hidden');
    }

    if (event.description) {
        elements.detailDescItem.classList.remove('hidden');
        elements.detailDescription.textContent = event.description;
    } else {
        elements.detailDescItem.classList.add('hidden');
    }

    elements.eventDetailModal.classList.remove('hidden');
}

function closeDetailModal() {
    elements.eventDetailModal.classList.add('hidden');
    selectedDetailEventId = null;
}

function editEventFromDetail() {
    if (selectedDetailEventId) {
        openEditModal(selectedDetailEventId);
    }
}

function openDeleteModal() {
    if (selectedDetailEventId) {
        deletingEventId = selectedDetailEventId;
        elements.deleteConfirmModal.classList.remove('hidden');
        closeDetailModal();
    }
}

function closeDeleteModal() {
    elements.deleteConfirmModal.classList.add('hidden');
    deletingEventId = null;
}

async function confirmDelete() {
    if (!deletingEventId) return;

    try {
        const response = await fetch(`${API_URL}/${deletingEventId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete event');

        showToast('Event deleted successfully', 'success');
        await loadEvents();
        closeDeleteModal();
    } catch (error) {
        showToast('Failed to delete event', 'error');
        console.error(error);
    }
}

function updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const total = allEvents.length;
    const todayCount = allEvents.filter(e => e.date === todayStr).length;
    const upcoming = allEvents.filter(e => new Date(e.date + 'T' + e.time) > today).length;
    const past = total - todayCount - upcoming;

    elements.totalEvents.textContent = total;
    elements.todayEvents.textContent = todayCount;
    elements.upcomingEvents.textContent = upcoming;
    elements.pastEvents.textContent = past;
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

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
