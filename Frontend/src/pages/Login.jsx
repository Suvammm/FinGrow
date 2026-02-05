import { useState } from 'react';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      console.log("Attempting login with:", creds.email);
      const response = await login(creds);
      
      // 1. Verify we got a token back from your authController
      if (response.data && response.data.token) {
        // 2. Save to LocalStorage
        localStorage.setItem('token', response.data.token);
        
        console.log("Login Successful! Token stored.");
        
        // 3. Small delay ensures storage is synced before redirect
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError("Login failed: No token received from server.");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Wealth Engine Login</h2>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. test@gmail.com" 
              value={creds.email}
              onChange={e => setCreds({...creds, email: e.target.value})} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={creds.password}
              onChange={e => setCreds({...creds, password: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" className="login-btn">Sign In</button>
          
          <p className="auth-footer">
            Don't have an account? <span onClick={() => navigate('/register')}>Register here</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;