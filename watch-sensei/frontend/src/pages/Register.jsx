// frontend/src/pages/Register.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation before hitting the API
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      // Pointing to the register endpoint we built in Express
      const response = await axios.post('/api/auth/register', { username, password });
      
      if (response.data.success) {
        // Log them into global state and redirect instantly
        login(response.data.user); 
        navigate('/watchlist');     
      }
    } catch (err) {
      // Catch specific errors from your backend (like 409 Conflict for duplicate usernames)
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="mb-4 text-center fw-bold" style={{ color: 'var(--text-main)' }}>
          Join <span style={{ color: 'var(--accent-red)' }}>WatchSensei</span>
        </h2>
        
        {error && (
          <div className="alert alert-danger" style={{ backgroundColor: 'rgba(229, 9, 20, 0.1)', color: '#ff6b6b', border: 'none' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Choose a Username</label>
            <input 
              type="text" 
              className="custom-input"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Create a Password</label>
            <input 
              type="password" 
              className="custom-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
            <input 
              type="password" 
              className="custom-input"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn-crimson" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-red)', textDecoration: 'none' }}>Log in here.</Link>
        </p>
      </div>
    </div>
  );
}