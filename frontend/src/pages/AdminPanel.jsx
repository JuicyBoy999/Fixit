import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';

const AdminPanel = () => {
  const { user, logout } = useContext(AuthContext);

  useSessionTimeout(15 * 60 * 1000);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      logout();
    }
  }, [user, logout]);

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user?.email}</p>
      {/* Add admin management UI here */}
    </div>
  );
};

export default AdminPanel;
