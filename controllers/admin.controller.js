const adminService = require('../services/admin.service');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard();
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await adminService.getOrderById(id);
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const order = await adminService.updateOrderStatus(id, status, paymentStatus);
    res.json({
      success: true,
      data: order,
      message: 'Order status updated'
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await adminService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created'
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await adminService.updateProduct(id, req.body);
    res.json({
      success: true,
      data: product,
      message: 'Product updated'
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteProduct(id);
    res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
};

const createArtist = async (req, res, next) => {
  try {
    const artist = await adminService.createArtist(req.body);
    res.status(201).json({
      success: true,
      data: artist,
      message: 'Artist created'
    });
  } catch (error) {
    next(error);
  }
};

const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const artist = await adminService.updateArtist(id, req.body);
    res.json({
      success: true,
      data: artist,
      message: 'Artist updated'
    });
  } catch (error) {
    next(error);
  }
};

const deleteArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteArtist(id);
    res.json({
      success: true,
      message: 'Artist deleted'
    });
  } catch (error) {
    next(error);
  }
};

const createPortfolioItem = async (req, res, next) => {
  try {
    const item = await adminService.createPortfolioItem(req.body);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Portfolio item created'
    });
  } catch (error) {
    next(error);
  }
};

const updatePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await adminService.updatePortfolioItem(id, req.body);
    res.json({
      success: true,
      data: item,
      message: 'Portfolio item updated'
    });
  } catch (error) {
    next(error);
  }
};

const deletePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deletePortfolioItem(id);
    res.json({
      success: true,
      message: 'Portfolio item deleted'
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
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

