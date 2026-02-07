import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Register from './pages/Register';
import Opportunities from './pages/Opportunities'; // Imported your new page

/**
 * @description A wrapper component that checks for the JWT token.
 * If no token is found, it redirects the user to the Login page.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Private Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* These are rendered inside the <Outlet /> of Layout.jsx */}
          <Route index element={<Dashboard />} />
          <Route path="finance" element={<Finance />} />
          <Route path="goals" element={<Goals />} />
          
          {/* ADDED: New Opportunities Route */}
          <Route path="opportunities" element={<Opportunities />} />
        </Route>

        {/* Fallback: Redirect any unknown path to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;