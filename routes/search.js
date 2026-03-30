const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Handles both the initial page load (empty query) and search submissions
router.get('/', searchController.searchContent);

module.exports = router;