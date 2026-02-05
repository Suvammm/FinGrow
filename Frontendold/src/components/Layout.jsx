import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Persistent Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      {/* Optional: Simple Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        &copy; 2026 FinGrow Wealth Tracker. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;