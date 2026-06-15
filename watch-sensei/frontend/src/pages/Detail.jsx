// frontend/src/pages/Detail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Detail() {
  const { type, id } = useParams(); 
  const navigate = useNavigate();
  const [mediaData, setMediaData] = useState(null);
  const [error, setError] = useState(null);
  
  // State for the Trailer Modal
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Ref for the Similar Movies horizontal scroll
  const scrollRef = useRef(null);

  // State to track if scrolling is possible
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchDetails();
    window.scrollTo(0, 0); 
  }, [type, id]);

  useEffect(() => {
    if (mediaData && scrollRef.current) {
        checkScroll();
    }
  }, [mediaData]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`/api/details/${type}/${id}`);
      if (response.data.success) {
        setMediaData(response.data.data); 
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load details. The universe is expanding too fast.');
    }
  };

  const handleAdd = async () => {
    try {
      const { coreDetails, mediaType } = mediaData;
      const payload = {
        externalApiId: coreDetails.id.toString(),
        title: coreDetails.title || coreDetails.name,
        poster_url: coreDetails.poster_path ? `https://image.tmdb.org/t/p/w500${coreDetails.poster_path}` : '',
        mediaType: mediaType
      };

      const response = await axios.post('/api/watchlist', payload);
      if (response.data.success) {
        toast.success(`${payload.title} added to your watchlist!`);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error('Already in your watchlist!');
      } else {
        toast.error('Failed to add to watchlist.');
      }
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const scrollSimilar = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // --- THE FIX: Proper Loading Guard using mediaData ---
  if (!mediaData && !error) {
    return (
      <div className="recommend-wrapper">
        <div className="recommend-loading animate-fade-in">
          <div className="ai-pulse-ring"></div>
          <h2 className="loading-title">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) return <div className="page-container"><div className="alert alert-danger" style={{marginTop: '100px'}}>{error}</div></div>;
  if (!mediaData) return null;

  // --- Destructure all the new data we get from the backend ---
  const { coreDetails, trailerUrl, externalRatings, topReviews, streaming_providers } = mediaData;
  const backdropUrl = coreDetails.backdrop_path ? `https://image.tmdb.org/t/p/original${coreDetails.backdrop_path}` : '';
  const posterUrl = coreDetails.poster_path ? `https://image.tmdb.org/t/p/w500${coreDetails.poster_path}` : '';
  
  const cast = coreDetails.credits?.cast?.slice(0, 8) || [];
  const similar = coreDetails.recommendations?.results?.slice(0, 10) || [];

  return (
    <div className="detail-wrapper">
      
      {backdropUrl && (
        <div className="detail-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="backdrop-fade"></div>
        </div>
      )}

      <div className="page-container detail-content">
        <button className="btn-back" onClick={() => navigate(-1)}>
          &#8592; Back
        </button>

        <div className="detail-hero-section">
          
          <div className="detail-poster-container">
            {posterUrl ? (
              <img src={posterUrl} alt="Poster" className="detail-poster-img" />
            ) : (
              <div className="detail-poster-placeholder">No Image</div>
            )}
            
            <div className="poster-actions">
              <button onClick={handleAdd} className="btn-crimson btn-action-small">
                + Add to Watchlist
              </button>
              {trailerUrl && (
                <button onClick={() => setShowTrailer(true)} className="btn-outline-play-small">
                  &#9654; Trailer
                </button>
              )}
            </div>
          </div>

          <div className="detail-info-container">
            <h1 className="hero-movie-title">{coreDetails.title || coreDetails.name}</h1>
            
            {coreDetails.tagline && (
              <p className="hero-tagline">"{coreDetails.tagline}"</p>
            )}

            <div className="hero-meta">
              <span className="meta-year">{(coreDetails.release_date || coreDetails.first_air_date || 'TBA').substring(0, 4)}</span>
              {coreDetails.runtime && (
                <>
                  <span className="meta-dot">&bull;</span>
                  <span className="meta-time">{coreDetails.runtime} min</span>
                </>
              )}
               <span className="meta-dot">&bull;</span>
              <div className="hero-genres-inline">
                {coreDetails.genres?.map((genre, index) => (
                   <span key={genre.id}>{genre.name}{index < coreDetails.genres.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            </div>

            <p className="hero-overview-integrated">{coreDetails.overview || 'No synopsis available.'}</p>

            <div className="minimal-ratings-group">
               <div className="rating-aesthetic">
                 <div className="rating-aesthetic-val">&#9733; {coreDetails.vote_average?.toFixed(1)}</div>
                 <div className="rating-aesthetic-src">TMDB</div>
               </div>
               {externalRatings?.map((rating, i) => (
                  <div key={i} className="rating-aesthetic">
                    <div className="rating-aesthetic-val">{rating.Value}</div>
                    <div className="rating-aesthetic-src">{rating.Source === 'Internet Movie Database' ? 'IMDb' : rating.Source}</div>
                  </div>
               ))}
            </div>

            {/* --- THE FIX: Streaming Providers Section --- */}
            {streaming_providers && streaming_providers.length > 0 && (
              <div className="streaming-providers-section">
                <h4 className="providers-title">Available to Stream On:</h4>
                <div className="providers-grid">
                  {streaming_providers.map((provider) => (
                    <div key={provider.provider_id} className="provider-logo-wrapper" title={provider.provider_name}>
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`} 
                        alt={provider.provider_name} 
                        className="provider-logo"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cast.length > 0 && (
              <div className="cast-section">
                <h3 className="section-heading-subtle">Top Cast</h3>
                <div className="cast-grid">
                  {cast.map(actor => (
                    <div key={actor.id} className="cast-avatar-card">
                      <div className="cast-avatar-img">
                        {actor.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} />
                        ) : (
                          <div className="avatar-placeholder">{actor.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="cast-avatar-name">{actor.name}</span>
                      <span className="cast-avatar-role">{actor.character}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {topReviews && topReviews.length > 0 && (
          <div className="reviews-minimal-section">
            <h3 className="section-heading-subtle">User Voices</h3>
            <div className="reviews-minimal-grid">
              {topReviews.map(review => (
                <div key={review.id} className="review-minimal-card">
                  <div className="review-minimal-header">
                    <span className="review-author-name">{review.author}</span>
                    {review.author_details?.rating && (
                      <span className="review-rating-star">&#9733; {review.author_details.rating}/10</span>
                    )}
                  </div>
                  <p className="review-minimal-text">
                    "{review.content.length > 250 ? review.content.substring(0, 250) + '...' : review.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="similar-section-modern">
            <div className="similar-header">
              <h3 className="section-heading-subtle">More Like This</h3>
              <div className="similar-nav-arrows">
                <button 
                  onClick={() => scrollSimilar('left')} 
                  className={`nav-arrow ${!canScrollLeft ? 'nav-arrow-disabled' : ''}`}
                  disabled={!canScrollLeft}
                >
                  &#10094;
                </button>
                <button 
                  onClick={() => scrollSimilar('right')} 
                  className={`nav-arrow ${!canScrollRight ? 'nav-arrow-disabled' : ''}`}
                  disabled={!canScrollRight}
                >
                  &#10095;
                </button>
              </div>
            </div>
            
            <div 
                className="similar-scroll-container" 
                ref={scrollRef}
                onScroll={checkScroll}
            >
              {similar.map(item => {
                 const itemType = item.media_type || type; 
                 return (
                <Link key={item.id} to={`/media/${itemType}/${item.id}`} className="similar-card-modern">
                  <div className="similar-img-wrapper">
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt={item.title || item.name} />
                    ) : (
                      <div className="similar-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="similar-title-modern">{item.title || item.name}</div>
                </Link>
              )})}
            </div>
          </div>
        )}

      </div>

      {showTrailer && (
        <div className="trailer-modal-cinematic" onClick={() => setShowTrailer(false)}>
          <div className="trailer-content-wrapper" onClick={e => e.stopPropagation()}>
            <button className="btn-close-cinematic" onClick={() => setShowTrailer(false)}>✕</button>
            <div className="video-responsive">
              <iframe
                src={`${trailerUrl.replace('watch?v=', 'embed/')}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}