const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration Routes
router.get('/register', authController.renderRegister);
router.post('/register', authController.registerUser);

// Login Routes
router.get('/login', authController.renderLogin);
router.post('/login', authController.loginUser);

// Logout Route
router.get('/logout', authController.logoutUser);

module.exports = router;