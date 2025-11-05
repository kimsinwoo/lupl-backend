const { prisma } = require('../config/database');

const getAllProducts = async (filters = {}) => {
  const { page, limit, category, artist, status } = filters;
  
  const where = {};
  if (category) where.categoryId = category;
  if (artist) where.artistId = artist;
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        artist: true,
        variants: true,
        _count: {
          select: { reviews: true }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getFeaturedProducts = async () => {
  return await prisma.product.findMany({
    where: {
      status: 'active'
    },
    include: {
      category: true,
      artist: true,
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
};

const getProductById = async (id) => {
  // reviews를 별도로 조회하여 orderId 컬럼 에러 방지
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      artist: true,
      variants: true,
      _count: {
        select: { reviews: true }
      }
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // reviews를 별도로 조회 (orderId 컬럼이 없어도 작동하도록)
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    product.reviews = reviews;
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      product.averageRating = Number(avgRating.toFixed(1));
    } else {
      product.averageRating = 0;
    }
  } catch (error) {
    // orderId 컬럼이 없을 경우 빈 배열로 처리
    console.warn('Error loading reviews (possibly missing orderId column):', error.message);
    product.reviews = [];
    product.averageRating = 0;
  }

  return product;
};

const searchProducts = async (searchTerm, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { nameEn: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ]
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        artist: true,
        variants: true
      },
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getProductReviews = async (productId) => {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const createProduct = async (data) => {
  const { variants, ...productData } = data;
  
  return await prisma.product.create({
    data: {
      ...productData,
      variants: {
        create: variants || []
      }
    },
    include: {
      category: true,
      artist: true,
      variants: true
    }
  });
};

const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const { variants, ...productData } = data;

  return await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      ...(variants && {
        variants: {
          deleteMany: {},
          create: variants
        }
      })
    },
    include: {
      category: true,
      artist: true,
      variants: true
    }
  });
};

const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await prisma.product.delete({
    where: { id }
  });
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  searchProducts,
  getProductReviews,
  createProduct,
  updateProduct,
  deleteProduct
};

