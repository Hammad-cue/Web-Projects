const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/auth/register
 * @desc    Handles new user creation, input validation, and secure password hashing.
 */
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Basic Validation (400 Bad Request)
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // 2. Format Validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.' 
      });
    }

    // 3. Format Validation: Enforce minimum password security
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // 4. Database Check: Prevent duplicate usernames (409 Conflict)
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'That username is already taken. Please try another.' });
    }

    // 5. Security: Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword
    });
    
    await newUser.save();

    // 6. Session Management
    req.session.user = { id: newUser._id, username: newUser.username };
    
    // 7. REST Response (201 Created)
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful.',
      user: req.session.user
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred during registration.' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates existing users.
 */
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Locate user in the database
    const user = await User.findOne({ username });
    if (!user) {
      // 401 Unauthorized (Note: We keep the message vague for security purposes)
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Securely compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Establish the user session
    req.session.user = { id: user._id, username: user.username };
    
    // REST Response (200 OK)
    res.status(200).json({ 
      success: true, 
      message: 'Login successful.',
      user: req.session.user
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Destroys the current user session and clears the cookie.
 */
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to log out.' });
    }
    
    // Clear the session cookie from the browser explicitly
    res.clearCookie('connect.sid'); 
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
};