const express = require('express'); 
const auth = require('../middleware/auth'); 
const router = express.Router(); 

// The 'auth' middleware protects this route
router.get('/dashboard', auth, (req, res) => { 
    res.json({ 
        message: "Welcome to the protected dashboard!", 
        userId: req.user.id 
    }); 
}); 

module.exports = router;