import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  
  const [movies, setMovies] = useState([]);
  const [isTrending, setIsTrending] = useState(true);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- NEW: Cross-Reference State ---
  // We use an object (Dictionary) instead of an array so lookups are instant O(1)
  const [userWatchlist, setUserWatchlist] = useState({});

  // --- NEW: Modal States ---
  const [activeMovie, setActiveMovie] = useState(null);
  const [addStatus, setAddStatus] = useState("Plan to Watch");

  // Fetch Watchlist once on mount to establish cross-referencing
  useEffect(() => {
    fetchUserWatchlist();
  }, []);

  useEffect(() => {
    fetchMovies(submittedQuery, currentPage);
  }, [submittedQuery, currentPage]);

  const fetchUserWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      if (response.data.success) {
        // Convert the array into a Dictionary keyed by the TMDB ID
        const watchlistMap = {};
        response.data.data.forEach(item => {
          watchlistMap[item.externalApiId] = item;
        });
        setUserWatchlist(watchlistMap);
      }
    } catch (err) {
      console.error("Could not sync user universe data.");
    }
  };

  const fetchMovies = async (searchQuery, pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${searchQuery}&page=${pageNum}`);
      if (response.data.success) {
        setMovies(response.data.data.results);
        setIsTrending(response.data.data.isTrending);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      toast.error("Failed to fetch content.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(query); 
    setCurrentPage(1); 
  };

  // --- NEW: Modal Confirm Function ---
  const confirmAddToList = async () => {
    if (!activeMovie) return;

    try {
      const payload = {
        externalApiId: activeMovie.id.toString(),
        title: activeMovie.title || activeMovie.name,
        poster_url: activeMovie.poster_path ? `https://image.tmdb.org/t/p/w500${activeMovie.poster_path}` : "",
        mediaType: activeMovie.media_type || "movie",
        status: addStatus, // Passes the selected status from the modal
        liked: false 
      };

      const response = await axios.post("/api/watchlist", payload);

      if (response.data.success) {
        toast.success(`${payload.title} added as "${addStatus}"!`);
        // Update local dictionary so UI instantly shows it as added
        setUserWatchlist(prev => ({
          ...prev,
          [payload.externalApiId]: response.data.data // The newly created DB item
        }));
        setActiveMovie(null); // Close modal
      }
    } catch (err) {
      toast.error("Failed to add to watchlist.");
    }
  };

  // --- NEW: Persistent Heart Toggle ---
  const handleToggleLike = async (e, movie) => {
    e.preventDefault(); // Stop Link navigation
    const apiId = movie.id.toString();
    const existingItem = userWatchlist[apiId];

    if (existingItem) {
      // It's already in the watchlist -> Update the like status via PUT
      const newLikedStatus = !existingItem.liked;
      
      // Optimistic UI update
      setUserWatchlist(prev => ({ ...prev, [apiId]: { ...existingItem, liked: newLikedStatus } }));
      
      try {
        await axios.put(`/api/watchlist/${existingItem._id}`, { liked: newLikedStatus });
      } catch (err) {
        // Revert on failure
        setUserWatchlist(prev => ({ ...prev, [apiId]: { ...existingItem, liked: !newLikedStatus } }));
        toast.error("Network error. Couldn't save like.");
      }
    } else {
      // It's NOT in the watchlist yet -> Create it with liked=true
      try {
        const payload = {
          externalApiId: apiId,
          title: movie.title || movie.name,
          poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
          mediaType: movie.media_type || "movie",
          status: "Plan to Watch",
          liked: true
        };
        const response = await axios.post("/api/watchlist", payload);
        if (response.data.success) {
          setUserWatchlist(prev => ({ ...prev, [apiId]: response.data.data }));
          toast.success("Added to favorites!");
        }
      } catch (err) {
        toast.error("Failed to favorite.");
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-container">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-bar-wrapper">
          <input
            type="text"
            className="custom-input search-input"
            placeholder="Search for movies, anime, or TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-crimson search-btn" disabled={loading}>
            {loading ? "..." : "Search"}
          </button>
        </form>
      </div>

      <h2 className="section-title">
        {isTrending ? "Trending This Week" : `Search Results for "${submittedQuery}"`}
      </h2>

      <div className="movie-grid">
        {movies.map((movie) => {
          const type = movie.media_type || "movie";
          const apiId = movie.id.toString();
          
          // --- CROSS-REFERENCE CHECKS ---
          const watchlistItem = userWatchlist[apiId];
          const isAdded = !!watchlistItem; // true if it exists in the dictionary
          const isLiked = watchlistItem?.liked || false;

          return (
            <div key={movie.id} className="movie-card" style={{ position: 'relative' }}>
              
              {/* --- NEW: Discover Page Overlay --- */}
              <div className="card-overlay" style={{ zIndex: 2 }}>
                {isAdded ? (
                  <button className="btn-add" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'default' }}>
                    ✓ In Watchlist
                  </button>
                ) : (
                  <button onClick={(e) => { e.preventDefault(); setActiveMovie(movie); setAddStatus("Plan to Watch"); }} className="btn-add">
                    + Add to List
                  </button>
                )}
              </div>

              {/* --- NEW: Persistent Heart Overlay --- */}
              <div className="watchlist-heart-overlay" style={{ zIndex: 3 }}>
                <button onClick={(e) => handleToggleLike(e, movie)} className="btn-heart-glass">
                  <Heart 
                    size={20} 
                    fill={isLiked ? "#e50914" : "transparent"} 
                    color={isLiked ? "#e50914" : "rgba(255,255,255,0.7)"} 
                    className={isLiked ? "heart-beat" : ""}
                  />
                </button>
              </div>

              <Link to={`/media/${type}/${movie.id}`} style={{ textDecoration: "none" }}>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="movie-poster"
                    style={{ opacity: 0, transition: "opacity 0.5s ease-in-out" }}
                    onLoad={(e) => (e.target.style.opacity = 1)}
                  />
                ) : (
                  <div className="poster-placeholder">No Image</div>
                )}
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title || movie.name}</h3>
                  <p className="movie-date">
                    {(movie.release_date || movie.first_air_date || "").substring(0, 4)}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {movies.length > 0 && totalPages > 1 && (
        <div className="pagination-controls">
          <button className="btn-page" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
            &#8592; Previous
          </button>
          <span className="page-indicator">Page {currentPage} of {totalPages}</span>
          <button className="btn-page" onClick={handleNextPage} disabled={currentPage === totalPages || loading}>
            Next &#8594;
          </button>
        </div>
      )}

      {/* --- NEW: The "Add to List" Cinematic Modal --- */}
      {activeMovie && (
        <div className="modal-backdrop" onClick={() => setActiveMovie(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setActiveMovie(null)}><X size={20}/></button>
            
            <h2 className="modal-title">Add to Universe</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-0.5rem', fontSize: '0.9rem' }}>
              {activeMovie.title || activeMovie.name}
            </p>
            
            <div className="modal-form-group">
              <label>Initial Status</label>
              <select className="edit-select" value={addStatus} onChange={(e) => setAddStatus(e.target.value)}>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={confirmAddToList} className="btn-save">Confirm Add</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}