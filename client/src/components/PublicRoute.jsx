import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <p className="text-on-surface-variant font-medium">Loading session...</p>
        </div>
      );
  }

  // Authenticated - don't allow access to login/signup/landing
  if (user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
}
