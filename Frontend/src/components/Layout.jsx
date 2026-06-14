import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: '◫' },
    { to: '/profile', label: 'Profile', icon: '◎' },
    { to: '/finance', label: 'Wealth Entry', icon: '◈' },
    { to: '/goals', label: 'Goals', icon: '◌' },
    { to: '/opportunities', label: 'Market Opportunities', icon: '△' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">WE</div>
          <div>
            <h2 className="logo">Wealth Engine</h2>
            <p className="brand-tagline">Smart finance workspace</p>
          </div>
        </div>
        <div className="menu">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`menu-link ${isActive ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
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
