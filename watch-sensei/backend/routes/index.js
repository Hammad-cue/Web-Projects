const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/trending', async (req, res) => { // Changed '/' to '/trending' for clearer API naming
  let trendingPreviews = [];
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/trending/all/day`, {
      params: { api_key: process.env.TMDB_API_KEY }
    });
    trendingPreviews = response.data.results.filter(item => item.poster_path).slice(0, 6);
    
    // REST API Response
    res.json({ success: true, data: trendingPreviews });
  } catch (err) {
    console.error('Homepage TMDB Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch trending content' });
  }
});

module.exports = router;