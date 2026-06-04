require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const http = require('http')
const { initSocket } = require('./src/socket')
const { startCleanupJobs } = require('./src/jobs/cleanup')

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes v1
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/developers', require('./src/routes/developers'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/opportunities', require('./src/routes/opportunities'));
// v2 routes
app.use('/api/search',      require('./src/routes/search'))
app.use('/api/forum',       require('./src/routes/forum'))
app.use('/api/companies',   require('./src/routes/companies'))
app.use('/api/analytics',   require('./src/routes/analytics'))
app.use('/api/location',    require('./src/routes/location'))
// v3 routes
app.use('/api/chats',         require('./src/routes/chats'))
// app.use('/api/chats', require('./src/routes/chats'))
app.use('/api/groups',        require('./src/routes/groups'))
app.use('/api/applications',  require('./src/routes/applications'))
app.use('/api/notifications', require('./src/routes/notifications'))
app.use('/api/bookmarks',     require('./src/routes/bookmarks'))
app.use('/api/social',        require('./src/routes/social'))
app.use('/api/profile-likes',  require('./src/routes/profileLikes'))
app.use('/api/follow',         require('./src/routes/follow'))
app.use('/api/waitlist',       require('./src/routes/waitlist'))


// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KashDev API is running', timestamp: new Date() });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);
// Wrap express with HTTP server for Socket.io
const server = http.createServer(app)
initSocket(server)
startCleanupJobs()

// server.listen(PORT, () => {
//   console.log(`🚀 KashDev API + Socket.io running on port ${PORT}`)
// })

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 KashDev API + Socket.io running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});