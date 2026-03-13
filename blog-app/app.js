require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const { requestLogger } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogApp')
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => console.log('MongoDB connection error:', err));

// --- Middleware Setup ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, uploaded images)

// Express Session 
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
}));

// Express File Upload 
app.use(fileUpload({
    createParentPath: true
}));

app.use(requestLogger);

// Global variables for views (to easily check if user is logged in)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// --- Routes (We will connect these soon) ---
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', postRoutes);

// --- Server Listen ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});