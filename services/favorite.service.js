const { prisma } = require('../config/database');

const getFavorites = async (userId) => {
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          artist: true,
          variants: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const addFavorite = async (userId, productId) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId, productId }
    }
  });

  if (existing) {
    throw new Error('Product already in favorites');
  }

  return await prisma.favorite.create({
    data: { userId, productId },
    include: {
      product: {
        include: {
          category: true,
          artist: true,
          variants: true
        }
      }
    }
  });
};

const removeFavorite = async (userId, productId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId, productId }
    }
  });

  if (!favorite) {
    throw new Error('Favorite not found');
  }

  await prisma.favorite.delete({
    where: { id: favorite.id }
  });

  return { success: true };
};

const toggleFavorite = async (userId, productId) => {
  try {
    console.log('🔍 Toggle favorite service:', { userId, productId });
    
    // Check if product exists first
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      console.log('📌 Removing favorite');
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return { isFavorite: false, message: 'Removed from favorites' };
    } else {
      console.log('➕ Adding favorite');
      await prisma.favorite.create({
        data: { userId, productId }
      });
      return { isFavorite: true, message: 'Added to favorites' };
    }
  } catch (error) {
    console.error('❌ Error in toggleFavorite service:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    throw error;
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite
};

