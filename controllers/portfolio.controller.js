const portfolioService = require('../services/portfolio.service');

const getCategories = async (req, res, next) => {
  try {
    const categories = await portfolioService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryItems = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const items = await portfolioService.getCategoryItems(categoryId);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

const getAllItems = async (req, res, next) => {
  try {
    const items = await portfolioService.getAllItems();
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await portfolioService.getItemById(id);
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await portfolioService.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await portfolioService.createItem(req.body);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Portfolio item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await portfolioService.updateItem(id, req.body);
    res.json({
      success: true,
      data: item,
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await portfolioService.deleteItem(id);
    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
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

