import { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Safely extract the initial ONLY if the user exists (using Optional Chaining ?.)
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="custom-navbar">
      <div className="navbar-brand">
        <Link to="/search">
          Watch<span style={{ color: 'var(--accent-red)' }}>Sensei</span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <NavLink to="/" className="nav-item">Home</NavLink>
        <NavLink to="/search" className="nav-item">Discover</NavLink>
        <NavLink to="/recommend" className="nav-item">Ask Sensei</NavLink>
        
        {/* CONDITIONAL: Only show Watchlist if the user is logged in */}
        {user && (
          <NavLink to="/watchlist" className="nav-item">My Watchlist</NavLink>
        )}
      </div>

      <div className="navbar-user">
        {user ? (
          /* --- LOGGED IN VIEW --- */
          <div className="user-controls">
            <span className="user-greeting">Hi, {user.username}</span>
            <div className="user-actions">
              <Link to="/profile" className="user-avatar" title="Account Settings">
                {userInitial}
              </Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </div>
        ) : (
          /* --- LOGGED OUT VIEW --- */
          <div className="auth-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" className="nav-item" style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn-crimson" style={{ padding: '0.5rem 1.2rem', textDecoration: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}