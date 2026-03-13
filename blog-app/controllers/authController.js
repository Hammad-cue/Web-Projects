const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Render Registration Page
exports.getRegister = (req, res) => {
    res.render('register', { errors: [], formData: {} });
};

// Handle Registration
exports.postRegister = async (req, res) => {
    const errors = validationResult(req);
    // If validation fails, re-render the page with error messages
    if (!errors.isEmpty()) {
        return res.render('register', { 
            errors: errors.array(),
            formData: req.body // Keep the typed data so the user doesn't have to retype it
        });
    }

    const { username, email, password } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.render('register', {
                errors: [{ msg: 'Email or Username already exists' }],
                formData: req.body
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        // Redirect to login after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Render Login Page
exports.getLogin = (req, res) => {
    res.render('login', { errors: [], formData: {} });
};

// Handle Login
exports.postLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', { errors: errors.array(), formData: req.body });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { errors: [{ msg: 'Invalid Credentials' }], formData: req.body });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { errors: [{ msg: 'Invalid Credentials' }], formData: req.body });
        }

        // Set session variables
        req.session.user = {
            id: user._id,
            username: user.username
        };

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Handle Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/login');
    });
};