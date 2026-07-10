import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedAdminRoute() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
