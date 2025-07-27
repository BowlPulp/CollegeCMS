const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db');
const { ApiResponse } = require('./utils/ApiResponse');
const { ApiError } = require('./utils/ApiError');
const cookieParser = require('cookie-parser');
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
// Root route
app.get('/', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Server is running successfully!'));
});

// Add your routes here
app.use('/api/auth/staff', require('./routers/auth.router'));
// app.use('/api/users', require('./routes/users'));
app.use('/api/otp', require('./routers/otp.router'));
app.use('/api/sheets', require('./routers/sheet.router'));
app.use('/api/students', require('./routers/student.router'));
app.use('/api/chos', require('./routers/cho.router'));
app.use('/api/events', require('./routers/event.router'));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ 
      success: false,
      message: err.message,
      errors: err.errors || [],
      data: err.data || null
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      errors: [err.message],
      data: null
    });
  }
});

// Handle 404 routes
app.use('*any', (req, res) => {
  res.status(404).json(new ApiResponse(404, null, 'Route not found'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
