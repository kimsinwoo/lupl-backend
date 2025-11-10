const axios = require('axios');
const { prisma } = require('../config/database');

const approvePayment = async (paymentKey, orderId, amount) => {
  try {
    const secretKey = process.env.TOSS_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }

    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        paymentKey,
        orderId,
        amount
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Toss payment error:', error.response?.data || error.message);
    throw new Error('결제 승인 실패: ' + (error.response?.data?.message || error.message));
  }
};

const cancelPayment = async (paymentKey, cancelReason) => {
  try {
    const secretKey = process.env.TOSS_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }
    
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/' + paymentKey + '/cancel',
      {
        cancelReason
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Toss cancel error:', error.response?.data || error.message);
    throw new Error('결제 취소 실패: ' + (error.response?.data?.message || error.message));
  }
};

const processOrderPayment = async (orderId, paymentKey, amount) => {
  try {
    console.log('🔑 Processing payment with orderId:', orderId);
    
    // orderId에서 LUPL- 접두어 제거 (DB에서 찾기 위해)
    const actualOrderId = orderId.startsWith('LUPL-') ? orderId.replace('LUPL-', '') : orderId;
    console.log('🔑 Actual orderId for DB:', actualOrderId);
    
    // 주문 상태 확인 (이미 결제된 경우 처리)
    const existingOrder = await prisma.order.findUnique({
      where: { id: actualOrderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (existingOrder && existingOrder.paymentStatus === 'paid') {
      console.log('⚠️ Order already paid, returning existing order');
      return {
        order: existingOrder,
        payment: { message: 'Already processed' }
      };
    }
    
    // 토스페이먼츠 결제 승인 (원본 orderId 사용)
    const paymentResult = await approvePayment(paymentKey, orderId, amount);
    
    console.log('✅ Toss payment approved');
    
    // 주문 상태 업데이트 (actualOrderId 사용)
    // 결제 승인 시 받은 실제 금액(세금, 배송비 포함)을 total에 저장
    const finalAmount = Number(amount);
    console.log('💰 Storing final payment amount in DB:', {
      orderId: actualOrderId,
      amount: finalAmount,
      note: 'This includes tax, shipping, and all fees'
    });
    
    const order = await prisma.order.update({
      where: { id: actualOrderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing',
        total: finalAmount // 결제 승인 시 받은 실제 금액 (세금, 배송비 모두 포함)
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    console.log('✅ Order updated successfully');

    return {
      order,
      payment: paymentResult
    };
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    
    // "이미 처리된 결제" 에러는 무시 (중복 요청)
    if (error.message && error.message.includes('이미 처리된 결제')) {
      console.log('⚠️ Payment already processed, ignoring error');
      const actualOrderId = orderId.startsWith('LUPL-') ? orderId.replace('LUPL-', '') : orderId;
      const existingOrder = await prisma.order.findUnique({
        where: { id: actualOrderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        }
      });
      if (existingOrder) {
        return {
          order: existingOrder,
          payment: { message: 'Already processed' }
        };
      }
    }
    
    // 결제 실패 시 주문 상태 업데이트
    try {
      const actualOrderId = orderId.startsWith('LUPL-') ? orderId.replace('LUPL-', '') : orderId;
      const updateData = {
        paymentStatus: 'failed'
      };
      
      // amount가 제공된 경우 실패한 결제 금액도 저장
      if (amount) {
        updateData.total = Number(amount);
        console.log('💰 Storing failed payment amount in DB:', {
          orderId: actualOrderId,
          amount: Number(amount),
          note: 'Payment failed but amount recorded'
        });
      }
      
      await prisma.order.update({
        where: { id: actualOrderId },
        data: updateData
      });
    } catch (updateError) {
      console.error('❌ Failed to update order status:', updateError);
    }
    
    throw error;
  }
};

module.exports = {
  approvePayment,
  cancelPayment,
  processOrderPayment
};

