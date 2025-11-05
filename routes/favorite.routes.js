const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.post('/add', favoriteController.addFavorite);
router.post('/toggle', favoriteController.toggleFavorite);
router.delete('/remove/:productId', favoriteController.removeFavorite);

module.exports = router;

