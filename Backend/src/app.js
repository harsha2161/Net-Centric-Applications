const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const initEventListeners = require('./events/listeners');
const { initSocketManager, registerSocket, removeSocket } = require('./socket/socketManager');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

connectDB();
initEventListeners();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initSocketManager(io);

io.on('connection', (socket) => {
  const socketManager = require('./socket/socketManager');

  // Client emits 'register' with their userId right after connecting
  socket.on('register', (userId) => {
    if (userId) {
      registerSocket(userId, socket.id);
      // Store userId on socket for fast disconnect lookup
      socket.userId = userId.toString();
      console.log(`[Socket] User ${userId} registered → socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      removeSocket(socket.userId, socket.id);
    }
    console.log(`[Socket] Socket ${socket.id} disconnected`);
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Net-Centric Application Backend Services API',
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', interactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
