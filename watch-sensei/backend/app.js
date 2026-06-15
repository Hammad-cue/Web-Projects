import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors'; // NEW: Required for React

// Route Imports (Notice we add .js to the end of local files!)
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import searchRouter from './routes/search.js';
import watchlistRouter from './routes/watchlist.js';
import detailsRouter from './routes/details.js';
import profileRouter from './routes/profile.js';
import recommendRoute from './routes/recommend.js';

const app = express();

/**
 * 1. DATABASE CONNECTION
 */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/watchsensei')
  .then(() => console.log('✅ Successfully connected to MongoDB for WatchSensei'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/**
 * 2. CORS CONFIGURATION (NEW)
 * Allows your React frontend (on port 5173) to securely request data from this API.
 */
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true // Crucial: Allows Express to accept session cookies from React
}));

/**
 * 3. STANDARD MIDDLEWARE
 * Stripped of EJS and static public folder serving.
 */
app.use(logger('dev'));
app.use(express.json()); // Parses incoming JSON payloads from React
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * 4. SESSION MANAGEMENT
 * Updated with specific cookie settings for decoupled architecture.
 */
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_watchsensei_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true later if deploying with HTTPS
    httpOnly: true, 
    sameSite: 'lax', // Important for local React-to-Express cookie sharing
    maxAge: 1000 * 60 * 60 * 24 * 7,

  } 
}));

/**
 * 5. ROUTE REGISTRATION (API ENDPOINTS)
 * Appended '/api' to best separate your backend logic from frontend URLs.
 */
app.use('/api/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/details', detailsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/recommend', recommendRoute); // NEW: AI Recommendation Endpoint
/**
 * 6. ERROR HANDLING (JSON FORMAT)
 * Switched from rendering HTML error pages to returning strict JSON error objects.
 */
app.use(function(req, res, next) {
  next(createError(404, 'API Endpoint Not Found'));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

export default app;