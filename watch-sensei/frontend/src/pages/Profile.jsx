import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useContext(AuthContext);
  
  // Local state for the settings form (Ready to be wired to the backend later)
  const [email, setEmail] = useState(user.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate an API call for now
    setTimeout(() => {
      toast.success('Settings updated successfully!');
      setIsUpdating(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This will delete your watchlist permanently.")) {
      toast.error('Account deletion endpoint not yet connected.');
    }
  };

  return (
    <div className="page-container">
      <div className="settings-wrapper">
        
        {/* --- Profile Identity Section --- */}
        <div className="profile-header-card">
          <div className="avatar-large">
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="profile-info">
            <h2 className="profile-username">{user.username}</h2>
            <p className="profile-role">Sensei Member</p>
          </div>
        </div>

        {/* --- Account Settings Section --- */}
        <div className="settings-card">
          <h3 className="settings-title">Account Settings</h3>
          
          <form onSubmit={handleUpdate} className="settings-form">
            <div className="form-group mb-4">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="custom-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Sensei AI Strictness</label>
              <select className="custom-input select-input">
                <option value="balanced">Balanced (Recommended)</option>
                <option value="obscure">Obscure Hidden Gems Only</option>
                <option value="blockbusters">Mainstream Blockbusters</option>
              </select>
              <small className="input-hint">How the AI chooses your recommendations.</small>
            </div>

            <button type="submit" className="btn-crimson btn-save" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} className="btn-outline-danger">
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}