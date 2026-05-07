// Global variables
let selectedMovie = null;
let selectedShowtime = null;
let selectedSeats = [];
let movies = [];
let bookings = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  setupEventListeners();
});

// Load movies from server
async function loadMovies() {
  try {
    const response = await fetch('/movies');
    movies = await response.json();
    displayMovies();
    populateMovieSelect();
  } catch (error) {
    console.error('Error loading movies:', error);
  }
}

// Display movies in grid
function displayMovies() {
  const moviesGrid = document.getElementById('movies-grid');
  moviesGrid.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="selectMovie(${movie.id})">
      <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${movie.genre} • ${movie.duration}</p>
        <div class="movie-rating">
          ${'★'.repeat(Math.floor(movie.rating))}${'☆'.repeat(5 - Math.floor(movie.rating))}
          ${movie.rating}
        </div>
        <button class="book-movie-btn" onclick="selectMovie(${movie.id}); scrollToSection('booking')">Book Now</button>
      </div>
    </div>
  `).join('');
}

// Populate movie select dropdown
function populateMovieSelect() {
  const movieSelect = document.getElementById('movie-select');
  movieSelect.innerHTML = '<option value="">Choose a movie</option>' +
    movies.map(movie => `<option value="${movie.id}">${movie.title}</option>`).join('');
}

// Select a movie
function selectMovie(movieId) {
  selectedMovie = movies.find(m => m.id === movieId);
  selectedShowtime = null;
  selectedSeats = [];
  document.getElementById('movie-select').value = movieId;
  loadShowtimes();
  updateSummary();
}

// Load showtimes for selected movie
function loadShowtimes() {
  if (!selectedMovie) return;

  const showtimesDiv = document.getElementById('showtimes');
  showtimesDiv.innerHTML = selectedMovie.showtimes.map(time => `
    <button class="showtime-btn" onclick="selectShowtime('${time}')">${time}</button>
  `).join('');
}

// Select a showtime
function selectShowtime(time) {
  selectedShowtime = time;
  selectedSeats = [];
  generateSeats();
  updateSummary();

  // Update selected showtime button
  document.querySelectorAll('.showtime-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === time);
  });
}

// Generate seat layout
function generateSeats() {
  if (!selectedMovie || !selectedShowtime) return;

  const seatsDiv = document.getElementById('seats');
  const rows = 8;
  const cols = 10;

  seatsDiv.innerHTML = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
      const isOccupied = Math.random() < 0.3; // Randomly occupy 30% of seats
      const seatClass = isOccupied ? 'occupied' : 'available';

      const seat = document.createElement('div');
      seat.className = `seat ${seatClass}`;
      seat.textContent = seatId;
      seat.onclick = () => toggleSeat(seatId, seat);
      seatsDiv.appendChild(seat);
    }
  }
}

// Toggle seat selection
function toggleSeat(seatId, seatElement) {
  if (seatElement.classList.contains('occupied')) return;

  const index = selectedSeats.indexOf(seatId);
  if (index > -1) {
    selectedSeats.splice(index, 1);
    seatElement.classList.remove('selected');
    seatElement.classList.add('available');
  } else {
    selectedSeats.push(seatId);
    seatElement.classList.remove('available');
    seatElement.classList.add('selected');
  }

  updateSummary();
}

// Update booking summary
function updateSummary() {
  const summaryDiv = document.getElementById('summary');
  const bookBtn = document.getElementById('book-btn');

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    summaryDiv.innerHTML = '<p>No seats selected</p>';
    bookBtn.disabled = true;
    return;
  }

  const totalPrice = selectedSeats.length * selectedMovie.price;
  summaryDiv.innerHTML = `
    <p><strong>Movie:</strong> ${selectedMovie.title}</p>
    <p><strong>Showtime:</strong> ${selectedShowtime}</p>
    <p><strong>Seats:</strong> ${selectedSeats.join(', ')}</p>
    <p><strong>Total:</strong> $${totalPrice}</p>
  `;
  bookBtn.disabled = false;
}

// Setup event listeners
function setupEventListeners() {
  // Movie select change
  document.getElementById('movie-select').addEventListener('change', (e) => {
    const movieId = parseInt(e.target.value);
    if (movieId) selectMovie(movieId);
  });

  // Book button
  document.getElementById('book-btn').addEventListener('click', () => {
    document.getElementById('payment-modal').style.display = 'block';
  });

  // Payment form
  document.getElementById('payment-form').addEventListener('submit', handlePayment);

  // Modal close
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    };
  });

  // Close modal when clicking outside
  window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  };

  // Smooth scrolling for nav links
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });
}

// Handle payment submission
async function handlePayment(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    movieId: selectedMovie.id,
    showtime: selectedShowtime,
    seats: selectedSeats,
    totalPrice: selectedSeats.length * selectedMovie.price
  };

  try {
    const response = await fetch('/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      showConfirmation(result.bookingId);
    } else {
      alert('Booking failed: ' + result.message);
    }
  } catch (error) {
    console.error('Error booking:', error);
    alert('Error booking tickets. Please try again.');
  }
}

// Show booking confirmation
function showConfirmation(bookingId) {
  document.getElementById('payment-modal').style.display = 'none';
  const confirmationDiv = document.getElementById('confirmation-details');
  confirmationDiv.innerHTML = `
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Movie:</strong> ${selectedMovie.title}</p>
    <p><strong>Showtime:</strong> ${selectedShowtime}</p>
    <p><strong>Seats:</strong> ${selectedSeats.join(', ')}</p>
    <p><strong>Total Paid:</strong> $${selectedSeats.length * selectedMovie.price}</p>
    <p>A confirmation email has been sent to your email address.</p>
  `;
  document.getElementById('confirmation-modal').style.display = 'block';
}

// Utility function for smooth scrolling
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth'
    });
  }
}