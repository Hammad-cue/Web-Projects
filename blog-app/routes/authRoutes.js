const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth'); // Prevent logged-in users from seeing login

// Registration Routes
router.get('/register', forwardAuthenticated, authController.getRegister);
router.post('/register', forwardAuthenticated, [
    check('username', 'Username must be at least 3 characters').isLength({ min: 3 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], authController.postRegister);

// Login Routes
router.get('/login', forwardAuthenticated, authController.getLogin);
router.post('/login', forwardAuthenticated, [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], authController.postLogin);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;