import { createContext, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check local storage on initial load so the Navbar doesn't vanish on refresh!
 const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('watchSenseiUser');
      // If it exists, parse it. If not, return null.
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      // If the data is corrupted, delete it and return null to prevent a crash
      console.error("Corrupted local storage found. Clearing...");
      localStorage.removeItem('watchSenseiUser');
      return null;
    }
  });
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('watchSenseiUser', JSON.stringify(userData)); // Save to storage
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      localStorage.removeItem('watchSenseiUser'); // Clear from storage
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};