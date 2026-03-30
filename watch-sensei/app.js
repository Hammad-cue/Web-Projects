require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

// Route Imports
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');
const watchlistRouter = require('./routes/watchlist');
const detailsRouter = require('./routes/details');

const app = express();

/**
 * 1. DATABASE CONNECTION
 * Establishes connection to the local MongoDB instance using Mongoose.
 */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/watchsensei')
  .then(() => console.log('✅ Successfully connected to MongoDB for WatchSensei'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/**
 * 2. VIEW ENGINE & LAYOUTS
 * Configures EJS as the templating engine and sets up the global layout wrapper.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); 

/**
 * 3. STANDARD MIDDLEWARE
 * Handles logging, parsing incoming request bodies (JSON/URL-encoded), and serving static files.
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 4. SESSION MANAGEMENT
 * Configures secure, temporary storage for user authentication state.
 */
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_watchsensei_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if deploying with HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day expiration
  } 
}));

/**
 * 5. CUSTOM UI MIDDLEWARE
 * Injects the logged-in user's data into res.locals, making it globally accessible to all EJS views 
 * (e.g., for dynamically rendering the navbar).
 */
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

/**
 * 6. ROUTE REGISTRATION (API ENDPOINTS)
 * Maps URL prefixes to their respective router files.
 */
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);
app.use('/watchlist', watchlistRouter);
app.use('/details', detailsRouter);

/**
 * 7. ERROR HANDLING
 * Catches unhandled routes (404) and generic server errors (500), rendering a user-friendly error page.
 */
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;