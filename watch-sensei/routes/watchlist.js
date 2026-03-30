const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { requireAuth } = require('../middleware/authMiddleware');

// Apply the requireAuth middleware to ALL routes in this file
router.use(requireAuth);

// CRUD Routes
router.get('/', watchlistController.getWatchlist);
router.post('/add', watchlistController.addToWatchlist);
router.post('/update/:id', watchlistController.updateItem);
router.post('/delete/:id', watchlistController.deleteItem);

module.exports = router;