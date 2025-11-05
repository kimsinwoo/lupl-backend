const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');

router.get('/categories', portfolioController.getCategories);
router.get('/categories/:categoryId', portfolioController.getCategoryItems);
router.get('/items', portfolioController.getAllItems);
router.get('/items/:id', portfolioController.getItemById);
router.post('/categories', portfolioController.createCategory);
router.post('/items', portfolioController.createItem);
router.put('/items/:id', portfolioController.updateItem);
router.delete('/items/:id', portfolioController.deleteItem);

module.exports = router;

