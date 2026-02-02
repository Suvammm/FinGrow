require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to MongoDB
connectDB();

const app = express();

// 3. Standard Middlewares

 // Allows Frontend to communicate with Backend
app.use(express.json()); // Allows Backend to read JSON data from requests
app.use(cors()); 
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

app.listen(PORT, () => {
  console.log(`🚀 Wealth Engine running on port ${PORT}`);
});
