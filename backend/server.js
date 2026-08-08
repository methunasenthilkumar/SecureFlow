const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Enable Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach Socket.io instance to app so routes can access it via req.app.get('io')
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO Connection & Room Join Logic
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    }
  });

  socket.on('join_analysts_room', () => {
    socket.join('analysts_room');
    console.log(`Socket ${socket.id} joined analysts_room`);
  });

  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'UPIShield Backend API Gateway',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analyst', require('./routes/analystRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`UPIShield Express Server & Socket.IO running on port ${PORT}`);
});
