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
    notes,
    items
  } = orderData;

  if (!items || items.length === 0) {
    throw new Error('Order is empty');
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true }
    });

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const price = product.price;
    const quantity = item.quantity;
    subtotal += price * quantity;

    let variantId = null;
    if (item.variantId) {
      const variant = product.variants.find(v => v.id === item.variantId);
      if (variant) {
        variantId = variant.id;
        
        // Update stock
        if (variant.stock < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock - quantity }
        });
      }
    }

    orderItems.push({
      productId: product.id,
      variantId,
      quantity,
      price
    });
  }

  const shipping = 3000;
  const tax = subtotal * 0.1;
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

