const paymentService = require('../services/payment.service');

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentKey, orderId, amount } = req.body;
    
    console.log('💰 Confirming payment:', { paymentKey, orderId, amount });
    
    const result = await paymentService.processOrderPayment(orderId, paymentKey, amount);
    
    console.log('✅ Payment confirmed successfully');
    
    res.json({
      success: true,
      data: result,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
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

