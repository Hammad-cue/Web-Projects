// This function acts as a bouncer for your protected routes
exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    // If there is no user session, redirect them to the login page
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
  // If they are logged in, allow them to proceed to the controller
  next();
};