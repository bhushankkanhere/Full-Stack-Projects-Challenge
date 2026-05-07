const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Sample movie data
const movies = [
  {
    id: 1,
    title: "The Dark Knight",
    genre: "Action",
    duration: "152 min",
    rating: 4.5,
    price: 12,
    poster: "https://via.placeholder.com/300x400/333/fff?text=Dark+Knight",
    showtimes: ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"]
  },
  {
    id: 2,
    title: "Inception",
    genre: "Sci-Fi",
    duration: "148 min",
    rating: 4.7,
    price: 14,
    poster: "https://via.placeholder.com/300x400/333/fff?text=Inception",
    showtimes: ["11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"]
  },
  {
    id: 3,
    title: "Pulp Fiction",
    genre: "Crime",
    duration: "154 min",
    rating: 4.3,
    price: 11,
    poster: "https://via.placeholder.com/300x400/333/fff?text=Pulp+Fiction",
    showtimes: ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"]
  },
  {
    id: 4,
    title: "The Shawshank Redemption",
    genre: "Drama",
    duration: "142 min",
    rating: 4.9,
    price: 13,
    poster: "https://via.placeholder.com/300x400/333/fff?text=Shawshank",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"]
  }
];

// In-memory storage for bookings
let bookings = [];
let bookingIdCounter = 1000;

// Routes
app.get("/movies", (req, res) => {
  res.json(movies);
});

app.post("/book", (req, res) => {
  const { name, email, phone, movieId, showtime, seats, totalPrice } = req.body;

  // Validate input
  if (!name || !email || !phone || !movieId || !showtime || !seats || seats.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if seats are available (simple check - in real app, check against database)
  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  // Generate booking ID
  const bookingId = `BK${bookingIdCounter++}`;

  // Create booking
  const booking = {
    id: bookingId,
    name,
    email,
    phone,
    movieId,
    movieTitle: movie.title,
    showtime,
    seats,
    totalPrice,
    timestamp: new Date().toISOString()
  };

  bookings.push(booking);

  console.log("New booking:", booking);

  res.json({
    message: "Booking successful!",
    bookingId,
    booking
  });
});

app.get("/bookings", (req, res) => {
  res.json(bookings);
});

// Remove old contact route
// app.post("/contact", ...);

app.listen(3000, () => {
  console.log("CinemaBook server running on http://localhost:3000");
});