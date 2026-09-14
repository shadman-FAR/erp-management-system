const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;