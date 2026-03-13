// middleware/auth.js

// 1. Logger Middleware: Logs every request with a timestamp and route
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request to ${req.originalUrl}`);
    next();
};

// 2. Authentication Middleware: Protects dashboard routes
const requireAuth = (req, res, next) => {
    // Check if the user session exists and has a userId attached
    if (req.session && req.session.user) {
        return next(); // User is authenticated, proceed to the route
    } else {
        // Unauthenticated users get kicked back to the login page
        return res.redirect('/login');
    }
};

// 3. Guest Middleware: Keeps logged-in users away from the login/register pages
const forwardAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return next(); // User is a guest, let them see the login/register page
    }
    // If they are already logged in, send them straight to the dashboard
    res.redirect('/dashboard');
};

module.exports = { 
    requestLogger, 
    requireAuth, 
    forwardAuthenticated 
};