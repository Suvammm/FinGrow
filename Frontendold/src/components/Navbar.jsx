import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Target, LogOut } from 'lucide-react';

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">F</div>
          FinGrow
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/finance" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium">
            <Wallet size={18} /> Finance
          </Link>
          <Link to="/goals" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium">
            <Target size={18} /> Goals
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;