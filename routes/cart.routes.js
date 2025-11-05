const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// 모든 cart 라우트는 인증이 필요함
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:id', cartController.updateCartItem);
router.delete('/remove/:id', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;

