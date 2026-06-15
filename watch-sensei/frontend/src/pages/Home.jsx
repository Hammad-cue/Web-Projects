// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-wrapper">
      {/* Background Layers */}
      <div className="home-bg-posters"></div>
      <div className="ambient-glow"></div>

      <div className="home-content">
        <header className="hero-section">
          
          {/* Top Badge */}
          <div style={{ height: '3.5rem' }} aria-hidden="true"></div>
          
          <h1 className="hero-title">
            Your Cinematic Universe, <br/> Mastered.
          </h1>
          <p className="hero-subtitle">
            Ditch the messy spreadsheets. WatchSensei syncs with live TMDB data to help you track, discover, and curate your ultimate media library.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <Link to="/watchlist" className="btn-crimson btn-massive glow-effect">
                Go to My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-crimson btn-massive glow-effect">
                  Start Your Journey
                </Link>
                <Link to="/login" className="btn-ghost">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Live Discovery</h3>
            <p>Tap into the live TMDB database to find trending movies and shows the second they drop.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Tracking</h3>
            <p>Organize your watchlist with custom statuses. Never forget what episode you left off on.</p>
          </div>
          {/* Highlighted AI Card */}
            <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Sensei</h3>
            <p>Get hyper-personalized recommendations from a context-aware AI that knows your exact taste.</p>
            </div>
        </section>

        {/* Footer Text */}
        <div className="home-footer-text">
          Data powered by TMDB. AI Sensei feature in active development.
        </div>
      </div>
    </div>
  );
}