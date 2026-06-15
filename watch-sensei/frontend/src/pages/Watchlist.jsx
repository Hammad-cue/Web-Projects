import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, SlidersHorizontal, X, Star, StarHalf, Heart } from 'lucide-react';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [likedFilter, setLikedFilter] = useState('All'); // NEW: Liked Filter

  const [editingItem, setEditingItem] = useState(null); 
  const [editData, setEditData] = useState({ status: '', rating: 0 });
  const [hoverRating, setHoverRating] = useState(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      if (response.data.success) {
        setWatchlist(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load your cinematic universe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`Banishing "${title}". Are you sure?`);
    if (isConfirmed) {
      try {
        await axios.delete(`/api/watchlist/${id}`);
        setWatchlist(watchlist.filter(item => item._id !== id));
        toast.success(`"${title}" deleted.`);
      } catch (error) {
        toast.error("Failed to delete item.");
      }
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setEditData({ status: item.status || 'Plan to Watch', rating: item.rating || 0 });
    setHoverRating(null); 
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    try {
      const response = await axios.put(`/api/watchlist/${editingItem._id}`, editData);
      if (response.data.success) {
        setWatchlist(watchlist.map(item => item._id === editingItem._id ? response.data.data : item));
        setEditingItem(null); 
        toast.success("Watchlist updated!");
      }
    } catch (error) {
      toast.error("Failed to save changes.");
    }
  };

  // --- NEW: 1-Click Quick Toggle for Hearts ---
  const toggleLike = async (e, item) => {
    e.preventDefault(); // Prevents the <Link> from redirecting you when you click the heart
    const newLikedStatus = !item.liked;
    
    // Optimistic UI Update (feels instantly fast to the user)
    setWatchlist(watchlist.map(w => w._id === item._id ? { ...w, liked: newLikedStatus } : w));

    try {
      await axios.put(`/api/watchlist/${item._id}`, { liked: newLikedStatus });
    } catch (error) {
      // Revert if it fails
      setWatchlist(watchlist.map(w => w._id === item._id ? { ...w, liked: !newLikedStatus } : w));
      toast.error("Network error. Couldn't save like.");
    }
  };

  const filteredWatchlist = watchlist.filter(item => {
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchType = typeFilter === 'All' || item.mediaType === typeFilter;
    const matchLiked = likedFilter === 'All' || (likedFilter === 'Favorites' && item.liked);
    return matchStatus && matchType && matchLiked;
  });

  const renderDisplayStars = (rating) => {
    return (
      <div className="display-stars">
        {[1, 2, 3, 4, 5].map((i) => {
          if (rating >= i) return <Star key={i} size={14} fill="#f1c40f" color="#f1c40f" />;
          if (rating >= i - 0.5) return <StarHalf key={i} size={14} fill="#f1c40f" color="#f1c40f" />;
          return <Star key={i} size={14} color="rgba(255,255,255,0.2)" />;
        })}
      </div>
    );
  };

  const handleStarMouseMove = (e, index) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    setHoverRating(percent < 0.5 ? index - 0.5 : index);
  };

  if (loading) return <div className="page-container"><div className="loading-spinner" style={{paddingTop: '100px'}}>Loading...</div></div>;

  return (
    <div className="page-container" style={{ paddingTop: '100px', minHeight: '100vh', position: 'relative' }}>
      
      <div className="watchlist-header-bar">
        <h1 className="section-heading" style={{ margin: 0 }}>My Universe</h1>
        
        <div className="watchlist-filters">
          <SlidersHorizontal size={18} className="filter-icon" />
          <select className="filter-dropdown" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Media</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          <select className="filter-dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Plan to Watch">Plan to Watch</option>
            <option value="Watching">Watching</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
          <select className="filter-dropdown" value={likedFilter} onChange={(e) => setLikedFilter(e.target.value)}>
            <option value="All">All Favorites</option>
            <option value="Favorites">Hearted ❤️</option>
          </select>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Your universe is currently empty.</h3>
          <Link to="/search" className="btn-crimson" style={{ marginTop: '20px', display: 'inline-block' }}>Discover Media</Link>
        </div>
      ) : filteredWatchlist.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>No media matches these filters.</h3>
          <button onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setLikedFilter('All'); }} className="btn-ghost" style={{ marginTop: '20px' }}>Clear Filters</button>
        </div>
      ) : (
        <div className="watchlist-grid">
          {filteredWatchlist.map(item => (
            <div key={item._id} className="watchlist-card">
              
              <div className="watchlist-poster-container">
                <Link to={`/media/${item.mediaType}/${item.externalApiId}`}>
                  <img src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'} alt={item.title} className="watchlist-poster" />
                </Link>
                
                {/* Edit/Delete Top Right Overlay */}
                <div className="watchlist-icon-overlay">
                  <button onClick={() => startEditing(item)} className="btn-icon-glass" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item._id, item.title)} className="btn-icon-glass delete-icon" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* NEW: Heart Bottom Right Overlay */}
                <div className="watchlist-heart-overlay">
                  <button onClick={(e) => toggleLike(e, item)} className="btn-heart-glass">
                    <Heart 
                      size={20} 
                      fill={item.liked ? "#e50914" : "transparent"} 
                      color={item.liked ? "#e50914" : "rgba(255,255,255,0.7)"} 
                      className={item.liked ? "heart-beat" : ""}
                    />
                  </button>
                </div>
              </div>
              
              <div className="watchlist-info">
                <h3 className="watchlist-title" title={item.title}>{item.title}</h3>
                <div className="watchlist-display-mode">
                  <div className="status-stack">
                    <div className={`status-badge status-${item.status?.replace(/\s+/g, '-').toLowerCase()}`}>
                      {item.status || 'Plan to Watch'}
                    </div>
                    {item.rating > 0 && renderDisplayStars(item.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The Cinematic Edit Modal (Remains identical to previous version) */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setEditingItem(null)}><X size={20}/></button>
            <h2 className="modal-title">Edit {editingItem.title}</h2>
            
            <div className="modal-form-group">
              <label>Status</label>
              <select className="edit-select" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label>Your Rating</label>
              <div className="interactive-stars" onMouseLeave={() => setHoverRating(null)}>
                {[1, 2, 3, 4, 5].map((i) => {
                  const displayValue = hoverRating !== null ? hoverRating : editData.rating;
                  let StarIcon = Star; let fill = "transparent"; let color = "rgba(255,255,255,0.2)";
                  if (displayValue >= i) { fill = "#f1c40f"; color = "#f1c40f"; } 
                  else if (displayValue >= i - 0.5) { StarIcon = StarHalf; fill = "#f1c40f"; color = "#f1c40f"; }
                  return (
                    <div key={i} className="star-hitbox" onMouseMove={(e) => handleStarMouseMove(e, i)} onClick={() => setEditData({...editData, rating: hoverRating})}>
                      <StarIcon size={32} fill={fill} color={color} className="interactive-star-icon" />
                    </div>
                  );
                })}
                <span className="rating-number-preview">{hoverRating !== null ? hoverRating : editData.rating} / 5</span>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={saveEdit} className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}