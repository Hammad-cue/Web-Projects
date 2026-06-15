// backend/routes/recommend.js
import express from 'express';
import { Groq } from 'groq-sdk';

const router = express.Router();


router.post('/', async (req, res) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });  
  const { surpriseMe, answers } = req.body;
  const strictnessProfile = "Balanced"; 

  let userPrompt = '';

  if (surpriseMe) {
    const hiddenThemes = [
      'cyberpunk dystopian', '90s indie thriller', 'forgotten sci-fi masterpiece', 
      'award-winning foreign drama', 'mind-bending psychological horror', 
      'uplifting underdog story', 'gritty crime syndicate', 'visually stunning fantasy',
      'dark comedy', 'slow-burn mystery'
    ];
    const randomTheme = hiddenThemes[Math.floor(Math.random() * hiddenThemes.length)];
    const seed = Date.now(); 

    userPrompt = `The user clicked "Surprise Me". Provide 3 COMPLETELY UNIQUE, highly-rated movies or TV shows. To ensure variety, focus specifically on this random vibe: "${randomTheme}". Do NOT recommend the most obvious blockbuster choices. Seed: ${seed}`;
  } else {
    userPrompt = `The user completed a quiz. They want a vibe that is "${answers.vibe}", set in a "${answers.setting}" environment, and they prefer "${answers.format}". Recommend 3 titles based on these exact preferences.`;
  }

  const systemPrompt = `You are an expert, highly creative movie recommendation engine. 
  You MUST return your response as a valid JSON object with a single key called "results". 
  "results" must be an array of exactly 3 objects.
  Each object must have exactly these keys: "title" (string), "year" (string), "type" (string: either "Movie" or "TV Show"), and "reason" (string: 2 sentences explaining why it fits the prompt).
  Do not include any markdown or conversational text outside of the JSON object.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      temperature: 0.9 
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // --- NEW: Fetch Posters from TMDB ---
    const tmdbApiKey = process.env.TMDB_API_KEY; // Make sure this is in your backend .env!
    
    const enrichedResults = await Promise.all(aiResponse.results.map(async (item) => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(item.title)}`);
        const data = await response.json();
        const bestMatch = data.results && data.results[0];
        
        return {
          ...item,
          // Attach TMDB data if found
          poster_url: bestMatch?.poster_path ? `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}` : null,
          id: bestMatch?.id || null,
          media_type: bestMatch?.media_type || (item.type.toLowerCase().includes('tv') ? 'tv' : 'movie')
        };
      } catch (err) {
        console.error(`Failed to fetch TMDB data for ${item.title}`);
        return item; // Return without poster if it fails, so it doesn't crash
      }
    }));

    return res.status(200).json({
      success: true,
      data: { results: enrichedResults }
    });

  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ success: false, message: 'Failed to generate recommendations.' });
  }
});

export default router;