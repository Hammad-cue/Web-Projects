const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Removed router.get('/register') and router.get('/login')

// REST APIs only process the form submissions
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser); 

module.exports = router;