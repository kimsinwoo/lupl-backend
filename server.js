const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/database');

// Load environment variables
const envResult = dotenv.config({ path: path.resolve(__dirname, '.env') });
if (envResult.error) {
  console.warn('⚠️ .env file not found or error loading:', envResult.error.message);
} else {
  console.log('✅ .env file loaded successfully');
}

// Debug: Check email configuration on startup
console.log('\n📧 Email Configuration on Startup:');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'NOT SET'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET'}`);
console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE ? process.env.EMAIL_SERVICE : 'NOT SET'}`);
console.log('');

const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

if (allowedOrigins.length === 0) {
  console.warn('⚠️ ALLOWED_ORIGINS is not set in environment variables');
}

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/artists', require('./routes/artist.routes'));
app.use('/portfolio', require('./routes/portfolio.routes'));
app.use('/products', require('./routes/product.routes'));
app.use('/categories', require('./routes/category.routes'));
app.use('/cart', require('./routes/cart.routes'));
app.use('/favorites', require('./routes/favorite.routes'));
app.use('/orders', require('./routes/order.routes'));
app.use('/reviews', require('./routes/review.routes'));
app.use('/announcements', require('./routes/announcement.routes'));
app.use('/partners', require('./routes/partner.routes'));
app.use('/contact', require('./routes/contact.routes'));
app.use('/payments', require('./routes/payment.routes'));
app.use('/admin', require('./routes/admin.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lupl Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  
  // If response was already sent, don't send again
  if (res.headersSent) {
    return next(err);
  }
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack,
      code: err.code
    } : undefined
  });
});

const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ PORT is not set in environment variables');
  process.exit(1);
}

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Lupl Backend Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

