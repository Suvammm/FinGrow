import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* 1. LEFT SIDEBAR - Fixed width */}
      <nav className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">Wealth Engine</h2>
          <div className="menu-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/finance" className={location.pathname === '/finance' ? 'active' : ''}>Wealth Entry</Link>
            <Link to="/goals" className={location.pathname === '/goals' ? 'active' : ''}>Goals</Link>
            <Link to="/opportunities" className={location.pathname === '/opportunities' ? 'active' : ''}>Market Opportunities</Link>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {/* 2. RIGHT SIDE - Header and Main Content */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <span className="breadcrumb">Pages / {location.pathname.replace('/', '') || 'Dashboard'}</span>
          </div>
          
          {/* PROFILE BUTTON IN TOP RIGHT CORNER */}
          <div className="header-right">
            <ProfileMenu />
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;