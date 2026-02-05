import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create and EXPORT the Context (This was missing the export before)
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in when app starts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // For now, we store the token. Later, you can fetch user profile here.
      setUser({ token });
    }
    setLoading(false);
  }, []);

  // Function to handle login
  const loginUser = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    navigate('/'); // Send user to dashboard after login
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};