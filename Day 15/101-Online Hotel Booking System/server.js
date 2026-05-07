const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const appFolder = __dirname;

app.use(cors());
app.use(express.json());
app.use(express.static(appFolder));

const rooms = [
  {
    id: 1,
    name: 'Ocean View Suite',
    description: 'Spacious suite with glass balcony, king bed, and ocean views.',
    price: 220.0,
    guests: 2,
    beds: 1,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Deluxe Double Room',
    description: 'City-facing room with two double beds and premium amenities.',
    price: 160.0,
    guests: 4,
    beds: 2,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Family Suite',
    description: 'Large suite perfect for families with living area and breakfast.',
    price: 280.0,
    guests: 5,
    beds: 3,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Standard Room',
    description: 'Cozy room with modern decor, ideal for business travelers.',
    price: 120.0,
    guests: 2,
    beds: 1,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80'
  }
];

let nextBookingId = 5001;
const bookings = [];

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/book', (req, res) => {
  const { fullName, email, phone, roomId, checkin, checkout, guests, nights, total } = req.body;
  if (!fullName || !email || !phone || !roomId || !checkin || !checkout || !guests || !nights || !total) {
    return res.status(400).json({ message: 'Booking information is incomplete.' });
  }

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Selected room not found.' });
  }

  const booking = {
    bookingId: nextBookingId++,
    timestamp: new Date().toISOString(),
    fullName,
    email,
    phone,
    room,
    checkin,
    checkout,
    guests,
    nights,
    total
  };

  bookings.push(booking);
  console.log('New booking:', booking);
  res.json({ bookingId: booking.bookingId, status: 'confirmed' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(appFolder, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Online Hotel Booking System running at http://localhost:${PORT}`);
});