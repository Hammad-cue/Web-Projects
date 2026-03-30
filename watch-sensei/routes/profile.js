const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Ensure only logged-in users can view stats
router.get('/', (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}, profileController.getUserProfile);

// 2. NEW ROUTE: The internal JSON API for AJAX filtering
router.get('/api/stats', (req, res, next) => {
  // If not logged in, return a 401 Unauthorized JSON error instead of a redirect
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, profileController.getStatsData);

// NEW ROUTE: Drill-down fetcher
router.get('/api/drilldown', (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, profileController.getDrillDownItems);

module.exports = router;