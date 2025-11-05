const { prisma } = require('../config/database');

const getCategories = async () => {
  return await prisma.portfolioCategory.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getCategoryItems = async (categoryId) => {
  return await prisma.portfolioItem.findMany({
    where: { categoryId },
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getAllItems = async () => {
  return await prisma.portfolioItem.findMany({
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getItemById = async (id) => {
  const item = await prisma.portfolioItem.findUnique({
    where: { id },
    include: {
      category: true
    }
  });

  if (!item) {
    throw new Error('Portfolio item not found');
  }

  return item;
};

const createCategory = async (data) => {
  return await prisma.portfolioCategory.create({
    data
  });
};

const createItem = async (data) => {
  return await prisma.portfolioItem.create({
    data,
    include: {
      category: true
    }
  });
};

const updateItem = async (id, data) => {
  const item = await prisma.portfolioItem.findUnique({
    where: { id }
  });

  if (!item) {
    throw new Error('Portfolio item not found');
  }

  return await prisma.portfolioItem.update({
    where: { id },
    data,
    include: {
      category: true
    }
  });
};

const deleteItem = async (id) => {
  const item = await prisma.portfolioItem.findUnique({
    where: { id }
  });

  if (!item) {
    throw new Error('Portfolio item not found');
  }

  await prisma.portfolioItem.delete({
    where: { id }
  });
};

module.exports = {
  getCategories,
  getCategoryItems,
  getAllItems,
  getItemById,
  createCategory,
  createItem,
  updateItem,
  deleteItem
};

