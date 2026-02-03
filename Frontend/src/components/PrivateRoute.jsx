import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If there is no token, redirect to login
  // We save the 'from' location so we can redirect back after login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, render the child components (Outlet)
  return <Outlet />;
};

export default PrivateRoute;