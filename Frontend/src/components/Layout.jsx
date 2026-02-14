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

  // Helper to get the title for the header based on the URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Market Dashboard';
    if (path === '/finance') return 'Wealth Entry';
    if (path === '/goals') return 'Financial Goals';
    if (path === '/opportunities') return 'Investment Opportunities';
    if (path === '/profile') return 'My Professional Profile';
    return 'Wealth Engine';
  };

  return (
    <div className="layout-container">
      {/* FIXED SIDEBAR */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <h2 className="logo">Wealth Engine</h2>
        </div>
        
        <div className="menu">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/finance" className={location.pathname === '/finance' ? 'active' : ''}>
            Wealth Entry
          </Link>
          <Link to="/goals" className={location.pathname === '/goals' ? 'active' : ''}>
            Goals
          </Link>
          <Link to="/opportunities" className={location.pathname === '/opportunities' ? 'active' : ''}>
            Market Opportunities
          </Link>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <h3 className="page-title">{getPageTitle()}</h3>
          </div>
          
          {/* PROFILE SECTION: Clicking this will navigate to /profile */}
          <div className="header-right" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <ProfileMenu />
          </div>
        </header>

        <main className="content-area">
          {/* This renders the Dashboard, Finance, Goals, or Profile page */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;