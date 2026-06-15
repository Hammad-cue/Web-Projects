const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// TRUE REST CRUD:
router.get('/', watchlistController.getWatchlist);          // READ list
router.post('/', watchlistController.addToWatchlist);       // CREATE item (Removed '/add')
router.put('/:id', watchlistController.updateItem);         // UPDATE item (Changed from POST /update/:id)
router.delete('/:id', watchlistController.deleteItem);      // DELETE item (Changed from POST /delete/:id)

module.exports = router;