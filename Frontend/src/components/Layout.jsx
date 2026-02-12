import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <h2 className="logo">Wealth Engine</h2>
        <div className="menu">
          <Link to="/">Dashboard</Link>
          <Link to="/finance">Wealth Entry</Link>
          <Link to="/goals">Goals</Link>
         
          <Link to="/opportunities">Market Opportunities</Link>
          
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;