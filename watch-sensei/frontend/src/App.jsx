// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react'; // <-- IMPORT THIS
import { AuthProvider, AuthContext } from './AuthContext'; // <-- IMPORT AuthContext
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Detail from './pages/Detail';
import Recommend from './pages/Recommend';

// --- THE BOUNCER: Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // If the user is NOT logged in, instantly redirect them to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If they are logged in, let them through to the page
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: { background: '#1A1A24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          }}
        />
        <Navbar /> 
        
        <Routes>
          {/* --- PUBLIC ROUTES (Anyone can see these) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/search" element={<Search />} />
          <Route path="/media/:type/:id" element={<Detail />} />

          {/* --- PROTECTED ROUTES (Must be logged in) --- */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;