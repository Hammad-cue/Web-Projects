const axios = require('axios');

/**
 * @route   GET /search
 * @desc    READ OPERATION: Fetches live data from TMDB.
 * If a query is provided, it searches for matching movies/anime.
 * If no query is provided, it serves the "Trending This Week" discovery engine.
 * Supports pagination for navigating large result sets.
 */
exports.searchContent = async (req, res) => {
  const query = req.query.q; 
  // Extract the page number from the URL, defaulting to page 1 if absent
  const currentPage = parseInt(req.query.page) || 1; 
  
  let results = [];
  let totalPages = 0; 
  let error = null;
  let isTrending = false; // Flag to tell the view whether to render the "Trending" or "Search" header

  try {
    const apiKey = process.env.TMDB_API_KEY; 

    if (query) {
      // 1. STANDARD SEARCH: User submitted a specific keyword
      const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
        params: {
          api_key: apiKey,
          query: query,
          language: 'en-US',
          page: currentPage,
          include_adult: false
        }
      });
      // Filter out actors/people, keeping only movies and TV shows
      results = response.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      totalPages = response.data.total_pages;

    } else {
      // 2. DISCOVERY ENGINE: Search bar is empty, fallback to weekly trending content
      isTrending = true;
      const response = await axios.get(`https://api.themoviedb.org/3/trending/all/week`, {
        params: {
          api_key: apiKey,
          page: currentPage
        }
      });
      results = response.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      totalPages = response.data.total_pages;
    }

  } catch (err) {
    console.error('TMDB API Error:', err.message);
    error = "Failed to fetch data from the live server. Please try again later.";
  }

  // Render the view with the fetched data and pagination state
  res.render('search', { results, query, error, currentPage, totalPages, isTrending });
};