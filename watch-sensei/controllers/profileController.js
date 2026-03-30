const mongoose = require('mongoose');
const WatchlistItem = require('../models/WatchlistItem');

// Helper function to keep our code DRY
const aggregateStats = async (matchStage) => {
  const statusAggregation = await WatchlistItem.aggregate([
    { $match: matchStage },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const ratingStats = await WatchlistItem.aggregate([
    { $match: { ...matchStage, rating: { $type: "number" } } },
    { $group: { _id: null, averageRating: { $avg: "$rating" }, ratedCount: { $sum: 1 } } }
  ]);

  return { statusAggregation, ratingStats };
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const { statusAggregation, ratingStats } = await aggregateStats({ user: userId });

    const chartLabels = statusAggregation.map(s => s._id || 'Unknown');
    const chartData = statusAggregation.map(s => s.count);
    const totalShows = chartData.reduce((a, b) => a + b, 0);

    const avgRating = ratingStats.length > 0 ? ratingStats[0].averageRating.toFixed(1) : 'N/A';
    const totalRated = ratingStats.length > 0 ? ratingStats[0].ratedCount : 0;

    res.render('profile', { 
      chartLabels: JSON.stringify(chartLabels), 
      chartData: JSON.stringify(chartData),
      totalShows, avgRating, totalRated 
    });
  } catch (err) {
    console.error(err);
    res.redirect('/watchlist');
  }
};

exports.getStatsData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const filterType = req.query.type; 

    let matchStage = { user: userId };
    if (filterType && filterType !== 'all') matchStage.mediaType = filterType;

    const { statusAggregation, ratingStats } = await aggregateStats(matchStage);

    const chartLabels = statusAggregation.map(s => s._id || 'Unknown');
    const chartData = statusAggregation.map(s => s.count);
    const totalShows = chartData.reduce((a, b) => a + b, 0);

    const avgRating = ratingStats.length > 0 ? ratingStats[0].averageRating.toFixed(1) : 'N/A';
    const totalRated = ratingStats.length > 0 ? ratingStats[0].ratedCount : 0;

    res.json({ chartLabels, chartData, totalShows, avgRating, totalRated });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

/**
 * @route   GET /profile/api/drilldown
 */
exports.getDrillDownItems = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = { user: req.session.user.id, status: status };
    if (type && type !== 'all') query.mediaType = type;

    const items = await WatchlistItem.find(query).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drill-down data' });
  }
};