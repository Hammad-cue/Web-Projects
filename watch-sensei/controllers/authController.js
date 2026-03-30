const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /auth/login & /auth/register
 * @desc    Render the authentication forms. Redirects to watchlist if already logged in.
 */
exports.renderLogin = (req, res) => {
  if (req.session.user) return res.redirect('/watchlist');
  res.render('login', { error: null });
};

exports.renderRegister = (req, res) => {
  if (req.session.user) return res.redirect('/watchlist');
  res.render('register', { error: null });
};

/**
 * @route   POST /auth/register
 * @desc    Handles new user creation, input validation, and secure password hashing.
 */
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Basic Validation: Ensure fields are not empty
    if (!username || !password) {
      return res.render('register', { error: 'All fields are required.' });
    }

    // 2. Format Validation: Restrict username to alphanumeric characters and underscores (3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.render('register', { 
        error: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.' 
      });
    }

    // 3. Format Validation: Enforce minimum password security
    if (password.length < 6) {
      return res.render('register', { error: 'Password must be at least 6 characters long.' });
    }

    // 4. Database Check: Prevent duplicate usernames (case-insensitive query)
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUser) {
      return res.render('register', { error: 'That username is already taken. Please try another.' });
    }

    // 5. Security: Hash the password using bcrypt before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword
    });
    
    await newUser.save();

    // 6. Session Management: Automatically log the user in upon successful registration
    req.session.user = { id: newUser._id, username: newUser.username };
    res.redirect('/search'); 

  } catch (error) {
    console.error('Registration Error:', error);
    res.render('register', { error: 'An internal server error occurred during registration.' });
  }
};

/**
 * @route   POST /auth/login
 * @desc    Authenticates existing users by comparing the provided password against the hashed DB entry.
 */
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Locate user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password.' });
    }

    // Securely compare the plaintext password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password.' });
    }

    // Establish the user session
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/watchlist');

  } catch (error) {
    console.error('Login Error:', error);
    res.render('login', { error: 'An error occurred during login.' });
  }
};

/**
 * @route   GET /auth/logout
 * @desc    Destroys the current user session and redirects to the login screen.
 */
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout Error:', err);
    res.redirect('/auth/login');
  });
};