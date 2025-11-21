const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const transactionsRoute = require('./routes/transactions');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middleware
const allowedOrigins = CLIENT_URL.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/admin', adminRoute);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
