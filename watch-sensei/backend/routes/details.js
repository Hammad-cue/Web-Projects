// backend/routes/details.js
import express from 'express';
import NodeCache from 'node-cache';

const router = express.Router();
const tmdbCache = new NodeCache({ stdTTL: 86400 }); 

router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const tmdbApiKey = process.env.TMDB_API_KEY;

  const cacheKey = `details-${type}-${id}`;
  const cachedData = tmdbCache.get(cacheKey);

  if (cachedData) {
    console.log(`⚡ Serving ${type} ${id} from CACHE`);
    return res.status(200).json({ success: true, data: cachedData });
  }

  try {
    console.log(`🐢 Fetching ${type} ${id} from TMDB API`);
    
    // We append EVERYTHING the frontend needs in one single, fast API call
    const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${tmdbApiKey}&append_to_response=videos,credits,recommendations,reviews,watch/providers`;
    
    const response = await fetch(tmdbUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'TMDB fetch failed' });
    }

    const data = await response.json();

    // 1. Extract the YouTube Trailer
    const trailer = data.videos?.results?.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    // 2. Extract Top 3 Reviews
    const topReviews = data.reviews?.results?.slice(0, 3) || [];

    // 3. Extract US Streaming Providers (Netflix, Hulu, etc.)
    const streamingProviders = data['watch/providers']?.results?.US?.flatrate || [];

    // 4. Repackage the data EXACTLY how your frontend Detail.jsx expects it!
    const formattedData = {
      coreDetails: data,
      mediaType: type,
      trailerUrl: trailerUrl,
      topReviews: topReviews,
      externalRatings: [], // Empty array for OMDB fallback so it doesn't crash
      streaming_providers: streamingProviders
    };

    // Save this perfectly formatted package to the cache
    tmdbCache.set(cacheKey, formattedData);

    return res.status(200).json({ success: true, data: formattedData });

  } catch (error) {
    console.error("Details API Error:", error);
    return res.status(500).json({ success: false, message: 'Server error fetching details.' });
  }
});

export default router;