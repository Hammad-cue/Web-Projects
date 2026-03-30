require('dotenv').config(); 
const express = require('express'); 
const mongoose = require('mongoose'); 

const authRoutes = require('./routes/auth'); 
const protectedRoutes = require('./routes/protected'); 

const app = express(); 
app.use(express.json()); 

// Modern Async Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1); 
    }
};
connectDB();

// Routes
app.use('/auth', authRoutes); 
app.use('/api', protectedRoutes); 

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
    console.log(`🚀 Server running on http://localhost:${PORT}`); 
});