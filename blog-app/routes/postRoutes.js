const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth'); // Protect these routes

// All routes here require the user to be logged in
router.get('/dashboard', requireAuth, postController.getDashboard);

router.get('/create-post', requireAuth, postController.getCreatePost);
router.post('/create-post', requireAuth, postController.postCreatePost);

// We use POST for deletion because HTML forms don't natively support DELETE methods without client-side JS overrides
router.post('/delete-post/:id', requireAuth, postController.deletePost);

// Edit routes
router.get('/edit-post/:id', requireAuth, postController.getEditPost);
router.post('/edit-post/:id', requireAuth, postController.postEditPost);

router.get('/post/:id', postController.getSinglePost);

module.exports = router;