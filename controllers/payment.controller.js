const paymentService = require('../services/payment.service');

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentKey, orderId, amount, tossOrderId } = req.body;
    
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentKey, orderId, amount'
      });
    }
    
    const result = await paymentService.processOrderPayment(orderId, paymentKey, amount, tossOrderId);
    
    res.json({
      success: true,
      data: result,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    next(error);
  }
};

const cancelPayment = async (req, res, next) => {
  try {
    const { paymentKey, cancelReason } = req.body;
    
    const result = await paymentService.cancelPayment(paymentKey, cancelReason);
    
    res.json({
      success: true,
      data: result,
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  confirmPayment,
  cancelPayment
};

