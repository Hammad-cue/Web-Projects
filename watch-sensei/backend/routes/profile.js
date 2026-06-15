const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Cleaned up Auth check (No redirects!)
const checkAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

router.use(checkAuth); // Apply to all routes in this file

router.get('/stats', profileController.getStatsData);         // Removed the duplicate /api/
router.get('/drilldown', profileController.getDrillDownItems); // Removed the duplicate /api/

module.exports = router;