// Load environment variables at the very top
require('dotenv').config();
console.log('Environment loaded, API Key exists:', !!process.env.GROQ_API_KEY);

const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();
const app = express();
const port = process.env.PORT || 5000;

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Enable CORS
app.use(cors());

// ✅ Middleware for JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ✅ Routes
app.use('/api/authentication', require('./routes/authentication.js'));
app.use('/api', require('./routes/fetchdoctorsdata.js'));
// Add chatbot routes
app.use('/api/chatbot', require('./routes/chatbot.js'));
// Add doctor registration routes - UPDATED PATH
app.use('/api/doctor-registration', require('./routes/doctor-registration.js'));

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Server is running correctly!',
    environment: process.env.NODE_ENV || 'development',
    apiKeyConfigured: !!process.env.GROQ_API_KEY
  });
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});