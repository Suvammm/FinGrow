import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Goals from './pages/Goals';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Only show Navbar if user is logged in */}
      {user && <Navbar />}
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/finance" element={user ? <Finance /> : <Navigate to="/login" />} />
          <Route path="/goals" element={user ? <Goals /> : <Navigate to="/login" />} />
          
          {/* Redirect any unknown routes to Dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;