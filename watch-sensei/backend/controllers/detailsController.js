const axios = require('axios');

/**
 * @route   GET /api/details/:type/:id
 * @desc    READ OPERATION: Dual-API Mashup (TMDB + OMDB)
 * Returns structured JSON containing movie/tv details, trailers, and ratings.
 */
exports.getContentDetails = async (req, res) => {
  const { type, id } = req.params; // Extracts 'movie' or 'tv' and the TMDB ID from the URL
  let data = null;
  let trailer = null;
  let omdbRatings = null; // Holds RT, Metacritic, IMDb scores
  let reviews = [];       // Holds TMDB user reviews

  try {
    const tmdbKey = process.env.TMDB_API_KEY;
    const omdbKey = process.env.OMDB_API_KEY;

    // 1. TMDB FETCH: Retrieve details, appending videos, credits, external_ids, and reviews
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
      params: {
        api_key: tmdbKey,
        append_to_response: 'videos,credits,external_ids,reviews,recommendations'
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
        // Non-fatal error: If OMDB fails, we just log it and proceed without external ratings
        console.error('OMDB API Error (Non-Fatal):', omdbErr.message);
      }
    }

    // 3. REST Response (200 OK)
    // Package everything React needs into a single, organized data object
    res.status(200).json({
      success: true,
      data: {
        coreDetails: data,
        mediaType: type,
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer}` : null,
        externalRatings: omdbRatings,
        topReviews: reviews
      }
    });

  } catch (err) {
    console.error('TMDB Details Error:', err.message);
    
    // Distinguish between a 404 (Movie not found) and a 500 (Server/Network issue)
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }
    
    res.status(500).json({ success: false, message: 'Could not load details for this item.' });
  }
};