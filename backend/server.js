require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

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

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/developers', require('./src/routes/developers'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/opportunities', require('./src/routes/opportunities'));
// Add these lines after the existing routes in server.js
app.use('/api/search',      require('./src/routes/search'))
app.use('/api/forum',       require('./src/routes/forum'))
app.use('/api/companies',   require('./src/routes/companies'))
app.use('/api/analytics',   require('./src/routes/analytics'))
app.use('/api/location',    require('./src/routes/location'))

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 KashDev API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});