const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Dashboard
router.get('/dashboard', adminMiddleware, adminController.getDashboard);

// User Management
router.get('/users', adminMiddleware, adminController.getAllUsers);
router.get('/users/:id', adminMiddleware, adminController.getUserById);
router.delete('/users/:id', adminMiddleware, adminController.deleteUser);

// Order Management
router.get('/orders', adminMiddleware, adminController.getAllOrders);
router.get('/orders/:id', adminMiddleware, adminController.getOrderById);
router.put('/orders/:id/status', adminMiddleware, adminController.updateOrderStatus);

// Product Management
router.post('/products', adminMiddleware, adminController.createProduct);
router.put('/products/:id', adminMiddleware, adminController.updateProduct);
router.delete('/products/:id', adminMiddleware, adminController.deleteProduct);

// Artist Management
router.post('/artists', adminMiddleware, adminController.createArtist);
router.put('/artists/:id', adminMiddleware, adminController.updateArtist);
router.delete('/artists/:id', adminMiddleware, adminController.deleteArtist);

// Portfolio Management
router.post('/portfolio/items', adminMiddleware, adminController.createPortfolioItem);
router.put('/portfolio/items/:id', adminMiddleware, adminController.updatePortfolioItem);
router.delete('/portfolio/items/:id', adminMiddleware, adminController.deletePortfolioItem);

// Analytics
router.get('/analytics', adminMiddleware, adminController.getAnalytics);

module.exports = router;

