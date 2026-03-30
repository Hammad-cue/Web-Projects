const express = require('express');
const router = express.Router();
const detailsController = require('../controllers/detailsController');

// Route expects /details/movie/12345 or /details/tv/67890
router.get('/:type/:id', detailsController.getContentDetails);

module.exports = router;