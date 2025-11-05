const { prisma } = require('../config/database');

const getDashboard = async () => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalArtists,
    todaySales,
    monthSales,
    recentOrders,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.artist.count(),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true }
    }),
    prisma.order.findMany({
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 3 }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalArtists,
      todaySales: todaySales._sum.total || 0,
      monthSales: monthSales._sum.total || 0
    },
    recentOrders,
    recentUsers
  };
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
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
};

const updateOrderStatus = async (id, status, paymentStatus) => {
  return await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus })
    }
  });
};

const createProduct = async (data) => {
  try {
    const { variants, ...productData } = data;
    
    // Parse images if it's a string
    let images = productData.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        // If parsing fails, treat as array with single image
        images = [images];
      }
    }
    if (!Array.isArray(images)) {
      images = images ? [images] : [];
    }
    
    // Ensure slug is unique by appending timestamp if needed
    let slug = productData.slug;
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });
    
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Ensure required fields
    const productDataToCreate = {
      name: productData.name,
      price: Number(productData.price),
      slug: slug,
      images: images,
      ...(productData.nameEn && { nameEn: productData.nameEn }),
      ...(productData.description && { description: productData.description }),
      ...(productData.sku && { sku: productData.sku }),
      ...(productData.status && { status: productData.status }),
      ...(productData.categoryId && { categoryId: productData.categoryId }),
      ...(productData.artistId && { artistId: productData.artistId }),
      variants: {
        create: (variants || []).map(v => ({
          size: v.size,
          color: v.color || null,
          stock: Number(v.stock) || 0
        }))
      }
    };
    
    return await prisma.product.create({
      data: productDataToCreate,
      include: {
        category: true,
        variants: true
      }
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw new Error(error.message || 'Failed to create product');
  }
};

const updateProduct = async (id, data) => {
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
    }
  });
};

const deleteProduct = async (id) => {
  await prisma.product.delete({ where: { id } });
};

const createArtist = async (data) => {
  return await prisma.artist.create({ data });
};

const updateArtist = async (id, data) => {
  return await prisma.artist.update({
    where: { id },
    data
  });
};

const deleteArtist = async (id) => {
  await prisma.artist.delete({ where: { id } });
};

const createPortfolioItem = async (data) => {
  return await prisma.portfolioItem.create({ data });
};

const updatePortfolioItem = async (id, data) => {
  return await prisma.portfolioItem.update({
    where: { id },
    data
  });
};

const deletePortfolioItem = async (id) => {
  await prisma.portfolioItem.delete({ where: { id } });
};

const getAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [revenue, orders, users] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true }
    }),
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })
  ]);

  return {
    revenue: revenue._sum.total || 0,
    orders,
    users
  };
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createArtist,
  updateArtist,
  deleteArtist,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getAnalytics
};

