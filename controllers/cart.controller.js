const cartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cart = await cartService.getCart(req.user.id);
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    console.log('🛒 Add to cart request:', { 
      userId: req.user?.id, 
      productId: req.body.productId, 
      variantId: req.body.variantId,
      quantity: req.body.quantity 
    });
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Variant ID are required'
      });
    }
    
    const cart = await cartService.addToCart(req.user.id, productId, variantId, quantity);
    res.status(201).json({
      success: true,
      data: cart,
      message: 'Added to cart'
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await cartService.updateCartItem(req.user.id, id, quantity);
    res.json({
      success: true,
      data: cart,
      message: 'Cart updated'
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;
    await cartService.removeCartItem(req.user.id, id);
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await cartService.clearCart(req.user.id);
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

