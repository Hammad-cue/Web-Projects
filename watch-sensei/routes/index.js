const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  let trendingPreviews = [];
  
  try {
    // Fetch top trending of the DAY for the homepage
    const response = await axios.get(`https://api.themoviedb.org/3/trending/all/day`, {
      params: { api_key: process.env.TMDB_API_KEY }
    });
    // Filter out items without posters, and just grab the top 6
    trendingPreviews = response.data.results.filter(item => item.poster_path).slice(0, 6);
  } catch (err) {
    console.error('Homepage TMDB Error:', err.message);
  }

  res.render('index', { trendingPreviews });
});

module.exports = router;