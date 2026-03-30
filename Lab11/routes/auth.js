const express = require('express'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt'); 
const User = require('../models/User'); 
const router = express.Router(); 

// Register Route 
router.post('/register', async (req, res) => { 
    try { 
        const { username, password } = req.body; 
        
        const exists = await User.findOne({ username }); 
        if (exists) return res.status(400).json({ message: 'User already exists' }); 
        
        const user = new User({ username, password }); 
        await user.save(); 
        res.status(201).json({ message: 'User registered successfully!' }); 

    } catch (err) { 
        // We pass err.message so Postman tells you EXACTLY what failed
        res.status(500).json({ message: 'Server error during registration', error: err.message }); 
    } 
}); 

// Login Route 
router.post('/login', async (req, res) => { 
    try { 
        const { username, password } = req.body; 
        
        const user = await User.findOne({ username }); 
        if (!user) return res.status(400).json({ message: 'User not found' }); 
        
        const match = await bcrypt.compare(password, user.password); 
        if (!match) return res.status(401).json({ message: 'Invalid password' }); 
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
        res.json({ token, message: "Login successful!" }); 

    } catch (err) { 
        res.status(500).json({ message: 'Server error during login', error: err.message }); 
    } 
}); 

module.exports = router;