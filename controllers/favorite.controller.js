const favoriteService = require('../services/favorite.service');

const getFavorites = async (req, res, next) => {
  try {
    console.log('🔍 Getting favorites for user:', req.user.id);
    const favorites = await favoriteService.getFavorites(req.user.id);
    console.log('✅ Favorites found:', favorites.length);
    console.log('📦 First favorite sample:', favorites[0] ? {
      id: favorites[0].id,
      productId: favorites[0].productId,
      hasProduct: !!favorites[0].product,
      productName: favorites[0].product?.name
    } : 'No favorites');
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('❌ Error in getFavorites controller:', error);
    console.error('❌ Error stack:', error.stack);
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    const favorite = await favoriteService.addFavorite(req.user.id, productId);
    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Added to favorites'
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Product already in favorites') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await favoriteService.removeFavorite(req.user.id, productId);
    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    if (error.message === 'Favorite not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    console.log('🔍 Toggle favorite request:', { userId: req.user.id, productId });
    
    const result = await favoriteService.toggleFavorite(req.user.id, productId);
    
    console.log('✅ Toggle favorite result:', result);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Error in toggleFavorite controller:', error);
    console.error('❌ Error stack:', error.stack);
    
    // More specific error handling
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Product already in favorites'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: 'Product or user not found'
      });
    }
    
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite
};

