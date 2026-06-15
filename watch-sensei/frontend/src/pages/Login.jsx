// frontend/src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.success) {
        login(response.data.user); // Save to global state
        navigate('/watchlist');     // Instant redirect to dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="mb-4 text-center fw-bold" style={{ color: 'var(--text-main)' }}>
          Welcome back to <span style={{ color: 'var(--accent-red)' }}>WatchSensei</span>
        </h2>
        
        {error && (
          <div className="alert alert-danger" style={{ backgroundColor: 'rgba(229, 9, 20, 0.1)', color: '#ff6b6b', border: 'none' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Username</label>
            <input 
              type="text" 
              className="custom-input"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              className="custom-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn-crimson" disabled={loading}>
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
        
        <p className="text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          New to WatchSensei? <Link to="/register" style={{ color: 'var(--accent-red)', textDecoration: 'none' }}>Sign up now.</Link>
        </p>
      </div>
    </div>
  );
}