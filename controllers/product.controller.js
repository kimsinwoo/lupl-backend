const productService = require('../services/product.service');

const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, artist, status } = req.query;
    const products = await productService.getAllProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      artist,
      status
    });
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const products = await productService.searchProducts(q, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await productService.getProductReviews(id);
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
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

