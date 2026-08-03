import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from './rolePermissions';
import { roleHome } from '../utils/rbac';

export default function RoleRoute({ allowedRoles, permission, redirectTo = '/welcome', children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth state is initializing, don't navigate away — avoids flicker
  if (loading) return null;

  if (!user) {
    // If a token exists in localStorage (including demo tokens), treat as authenticated and
    // redirect to the stored selected role's dashboard to avoid bouncing back to /welcome.
    const token = typeof window !== 'undefined' && window.localStorage.getItem('SmartCare-Connect_token');
    if (token) {
      const role = (typeof window !== 'undefined' && (window.localStorage.getItem('SmartCare-Connect_selected_role') || 'patient'));
      return <Navigate to={roleHome(role)} replace />;
    }

    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
