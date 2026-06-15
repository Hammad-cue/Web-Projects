const mongoose = require('mongoose');
const WatchlistItem = require('../models/WatchlistItem');

// Helper function to keep our code DRY (No changes needed here, perfect as is!)
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

/**
 * @route   GET /api/profile/stats
 * @desc    Gets aggregated stats for the user's charts (supports optional ?type= filter)
 */
exports.getStatsData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const filterType = req.query.type; 

    let matchStage = { user: userId };
    if (filterType && filterType !== 'all') matchStage.mediaType = filterType;

    const { statusAggregation, ratingStats } = await aggregateStats(matchStage);

    // Note: We removed JSON.stringify() because res.json() handles serialization automatically
    const chartLabels = statusAggregation.map(s => s._id || 'Unknown');
    const chartData = statusAggregation.map(s => s.count);
    const totalShows = chartData.reduce((a, b) => a + b, 0);

    const avgRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].averageRating.toFixed(1)) : null;
    const totalRated = ratingStats.length > 0 ? ratingStats[0].ratedCount : 0;

    // REST Response (200 OK)
    res.status(200).json({ 
      success: true, 
      data: {
        chartLabels, 
        chartData, 
        totalShows, 
        avgRating, 
        totalRated 
      }
    });
  } catch (err) {
    console.error('Stats Generation Error:', err);
    res.status(500).json({ success: false, message: 'Failed to load profile statistics.' });
  }
};

/**
 * @route   GET /api/profile/drilldown
 * @desc    Gets specific watchlist items when a user clicks a chart segment
 */
exports.getDrillDownItems = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = { user: req.session.user.id, status: status };
    if (type && type !== 'all') query.mediaType = type;

    const items = await WatchlistItem.find(query).sort({ createdAt: -1 });
    
    // REST Response (200 OK)
    res.status(200).json({ 
      success: true, 
      data: items 
    });
  } catch (err) {
    console.error('Drilldown Fetch Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch drill-down data.' });
  }
};