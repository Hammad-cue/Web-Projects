const axios = require('axios');

/**
 * @route   GET /details/:type/:id
 * @desc    READ OPERATION: Dual-API Mashup. 
 * 1. Fetches core movie/tv details, cast, and trailers from TMDB.
 * 2. Uses the TMDB-provided IMDb ID to fetch Rotten Tomatoes/Metacritic scores from OMDB.
 */
exports.getContentDetails = async (req, res) => {
  const { type, id } = req.params; // Extracts 'movie' or 'tv' and the TMDB ID from the URL
  let data = null;
  let trailer = null;
  let omdbRatings = null; // Holds RT, Metacritic, IMDb scores
  let reviews = [];       // Holds TMDB user reviews
  let error = null;

  try {
    const tmdbKey = process.env.TMDB_API_KEY;
    const omdbKey = process.env.OMDB_API_KEY;

    // 1. TMDB FETCH: Retrieve details, appending videos, credits, external IDs, and reviews in one call
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
      params: {
        api_key: tmdbKey,
        append_to_response: 'videos,credits,external_ids,reviews'
      }
    });

    data = tmdbResponse.data;

    // Isolate the official YouTube trailer
    if (data.videos && data.videos.results.length > 0) {
      const video = data.videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');
      trailer = video ? video.key : null;
    }

    // Extract the top 3 user reviews
    if (data.reviews && data.reviews.results) {
      reviews = data.reviews.results.slice(0, 3);
    }

    // 2. OMDB FETCH: Use the TMDB-provided IMDb ID to grab external critical scores
    const imdbId = data.imdb_id || (data.external_ids && data.external_ids.imdb_id);

    if (imdbId && omdbKey) {
      try {
        const omdbResponse = await axios.get(`https://www.omdbapi.com/`, {
          params: { i: imdbId, apikey: omdbKey }
        });
        
        if (omdbResponse.data && omdbResponse.data.Ratings) {
          omdbRatings = omdbResponse.data.Ratings;
        }
      } catch (omdbErr) {
        // Non-fatal error: If OMDB fails or limits are reached, the page will still load without RT badges
        console.error('OMDB API Error (Non-Fatal):', omdbErr.message);
      }
    }

  } catch (err) {
    console.error('TMDB Details Error:', err.message);
    error = "Could not load details for this item.";
  }

  res.render('details', { data, type, trailer, omdbRatings, reviews, error });
};