const roomGrid = document.getElementById('room-grid');
const searchBtn = document.getElementById('search-btn');
const viewRoomsBtn = document.getElementById('view-rooms-btn');
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');
const guestsInput = document.getElementById('guests');
const bookingSidebar = document.getElementById('booking-sidebar');
const sidebarClose = document.getElementById('sidebar-close');
const bookingDetails = document.getElementById('booking-details');
const roomTotalLabel = document.getElementById('room-total');
const bookingTotalLabel = document.getElementById('booking-total');
const reserveBtn = document.getElementById('reserve-btn');
const reserveMessage = document.getElementById('reserve-message');
const guestModal = document.getElementById('guest-modal');
const modalClose = document.getElementById('modal-close');
const bookingForm = document.getElementById('booking-form');

let rooms = [];
let selectedRoom = null;
let bookingDetailsState = null;
const EXTRA_FEE = 15.0;

async function initRooms() {
  try {
    const response = await fetch('/rooms');
    rooms = await response.json();
    renderRooms(rooms);
  } catch (error) {
    roomGrid.innerHTML = '<p class="error-message">Unable to load rooms. Please refresh.</p>';
    console.error(error);
  }
}

function renderRooms(roomList) {
  roomGrid.innerHTML = roomList
    .map(room => `
      <article class="room-card">
        <img class="room-image" src="${room.image}" alt="${room.name}">
        <div class="room-content">
          <h3 class="room-title">${room.name}</h3>
          <p class="room-description">${room.description}</p>
          <div class="room-meta">${room.guests} Guests • ${room.beds} Beds</div>
        </div>
        <div class="room-footer">
          <span class="room-price">$${room.price.toFixed(2)}/night</span>
          <button class="book-btn" data-id="${room.id}">Book</button>
        </div>
      </article>
    `)
    .join('');

  document.querySelectorAll('.book-btn').forEach(button => {
    button.addEventListener('click', () => {
      const roomId = Number(button.dataset.id);
      selectRoom(roomId);
    });
  });
}

function selectRoom(roomId) {
  selectedRoom = rooms.find(room => room.id === roomId);
  const checkin = checkinInput.value;
  const checkout = checkoutInput.value;
  const guests = Number(guestsInput.value);

  if (!checkin || !checkout) {
    alert('Please choose check-in and check-out dates first.');
    return;
  }

  if (new Date(checkout) <= new Date(checkin)) {
    alert('Check-out date must be after check-in.');
    return;
  }

  const nightCount = calculateNights(checkin, checkout);
  const roomCost = selectedRoom.price * nightCount;
  const total = roomCost + EXTRA_FEE;

  bookingDetailsState = {
    room: selectedRoom,
    checkin,
    checkout,
    guests,
    nights: nightCount,
    roomCost,
    total
  };

  renderBookingSidebar();
  showSidebar();
}

function calculateNights(checkin, checkout) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = end - start;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function renderBookingSidebar() {
  if (!bookingDetailsState) return;

  bookingDetails.innerHTML = `
    <div class="booking-item">
      <h4>${bookingDetailsState.room.name}</h4>
      <p>${bookingDetailsState.room.description}</p>
      <p><strong>Check-in:</strong> ${bookingDetailsState.checkin}</p>
      <p><strong>Check-out:</strong> ${bookingDetailsState.checkout}</p>
      <p><strong>Guests:</strong> ${bookingDetailsState.guests}</p>
      <p><strong>Nights:</strong> ${bookingDetailsState.nights}</p>
    </div>
  `;
  roomTotalLabel.textContent = `$${bookingDetailsState.roomCost.toFixed(2)}`;
  bookingTotalLabel.textContent = `$${bookingDetailsState.total.toFixed(2)}`;
  reserveBtn.disabled = false;
}

function showSidebar() {
  bookingSidebar.classList.add('visible');
}

function hideSidebar() {
  bookingSidebar.classList.remove('visible');
}

function openModal() {
  guestModal.classList.remove('hidden');
}

function closeModal() {
  guestModal.classList.add('hidden');
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  if (!bookingDetailsState) {
    alert('No room selected.');
    return;
  }

  const formData = {
    fullName: document.getElementById('full-name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    roomId: bookingDetailsState.room.id,
    checkin: bookingDetailsState.checkin,
    checkout: bookingDetailsState.checkout,
    guests: bookingDetailsState.guests,
    nights: bookingDetailsState.nights,
    total: bookingDetailsState.total
  };

  try {
    const response = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (response.ok) {
      reserveMessage.textContent = `Booking #${result.bookingId} confirmed! A confirmation email was sent to ${formData.email}.`;
      reserveMessage.classList.remove('hidden');
      closeModal();
      bookingForm.reset();
      reserveBtn.disabled = true;
    } else {
      alert(result.message || 'Booking could not be completed.');
    }
  } catch (error) {
    console.error(error);
    alert('Unable to complete booking. Please try again.');
  }
}

function filterRooms() {
  const guests = Number(guestsInput.value);
  const filtered = rooms.filter(room => room.guests >= guests);
  renderRooms(filtered);
}

viewRoomsBtn.addEventListener('click', () => {
  document.getElementById('checkin').scrollIntoView({ behavior: 'smooth' });
});
searchBtn.addEventListener('click', filterRooms);
sidebarClose.addEventListener('click', hideSidebar);
reserveBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
bookingForm.addEventListener('submit', handleBookingSubmit);
window.addEventListener('click', event => {
  if (event.target === guestModal) {
    closeModal();
  }
});

initRooms();