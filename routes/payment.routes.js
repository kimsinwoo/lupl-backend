const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/confirm', paymentController.confirmPayment);
router.post('/cancel', paymentController.cancelPayment);

module.exports = router;

