const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { startReceivableReminderJob } = require('./services/receivableReminderJob');

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// 3. Standard Middlewares

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json()); // Allows Backend to read JSON data from requests

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend is running',
    status: 'ok',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'API is healthy',
    status: 'ok',
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
// 4. Define Routes
// Auth handles Register/Login

// Finance handles Assets, Liabilities, and Net Worth


// 5. Global Error Handler (Optional but Recommended)
app.use('/api/goals', require('./routes/goalRoutes'));
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const allowNoDb = process.env.ALLOW_NO_DB === 'true';

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    if (!allowNoDb) {
      console.error(`Startup failed: ${error.message}`);
      process.exit(1);
    }
    console.warn('⚠️ Starting server without MongoDB (ALLOW_NO_DB=true)');
  }

  app.listen(PORT, () => {
    console.log(`Wealth Engine running on port ${PORT}`);
  });

  startReceivableReminderJob();
};

startServer();
