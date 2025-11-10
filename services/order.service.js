const { prisma } = require('../config/database');

const generateOrderNumber = () => {
  return `LUPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getOrderById = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return order;
};

const createOrder = async (userId, orderData) => {
  const {
    shippingName,
    shippingPhone,
    shippingAddress1,
    shippingAddress2,
    shippingCity,
    shippingZip,
    shippingCountry,
    paymentMethod,
    notes
  } = orderData;

  console.log('📦 Creating order for userId:', userId);

  // Get user's cart
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: true,
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  console.log('🛒 Found carts:', carts.length);
  carts.forEach((cart, idx) => {
    console.log(`🛒 Cart ${idx}:`, {
      id: cart.id,
      productId: cart.productId,
      productName: cart.product?.name,
      itemsCount: cart.items?.length || 0
    });
  });

  if (carts.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const cart of carts) {
    for (const item of cart.items) {
      const price = item.variant.product.price;
      const quantity = item.quantity;
      subtotal += price * quantity;

      orderItems.push({
        productId: cart.productId,
        variantId: item.variantId,
        quantity,
        price
      });

      // Update stock
      const newStock = item.variant.stock - quantity;
      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${cart.product.name}`);
      }

      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: newStock }
      });
    }
  }

  const shipping = 3000; // Fixed shipping cost (₩3,000)
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      shippingName,
      shippingPhone,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingZip,
      shippingCountry,
      paymentMethod,
      notes,
      subtotal,
      shipping,
      tax,
      total,
      items: {
        create: orderItems
      }
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });

  // Clear cart
  await prisma.cart.deleteMany({
    where: { userId }
  });

  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } } }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new Error('Cannot cancel this order');
  }

  // Restore stock
  for (const item of order.items) {
    if (item.variant) {
      await prisma.productVariant.update({
        where: { id: item.variant.id },
        data: {
          stock: { increment: item.quantity }
        }
      });
    }
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      paymentStatus: 'refunded'
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder
};

