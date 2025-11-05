const { prisma } = require('../config/database');

const getAllReviews = async (productId) => {
  const where = productId ? { productId } : {};
  
  return await prisma.review.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const createReview = async (userId, data) => {
  const { productId, orderId, rating, comment } = data;

  // orderId가 제공된 경우, 해당 주문이 DELIVERED 상태인지 확인
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'delivered'
      },
      include: {
        items: {
          where: {
            productId
          }
        }
      }
    });

    if (!order) {
      throw new Error('You can only review products from delivered orders');
    }

    if (order.items.length === 0) {
      throw new Error('This product is not in the specified order');
    }

    // 해당 주문의 해당 제품에 대한 리뷰가 이미 있는지 확인
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
        orderId
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product for this order');
    }

    return await prisma.review.create({
      data: {
        userId,
        productId,
        orderId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  // orderId가 없는 경우 기존 로직 유지 (하위 호환성)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      order: { 
        userId,
        status: 'delivered' // DELIVERED 주문만 리뷰 가능
      },
      productId
    }
  });

  if (!hasPurchased) {
    throw new Error('You can only review products you have purchased from delivered orders');
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId,
      orderId: null // orderId가 없는 리뷰 중복 체크
    }
  });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  return await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const updateReview = async (reviewId, userId, data) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const deleteReview = async (reviewId, userId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });
};

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
};

