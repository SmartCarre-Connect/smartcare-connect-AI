import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from './rolePermissions';
import { roleHome } from '../utils/rbac';

export default function RoleRoute({ allowedRoles, permission, redirectTo = '/welcome', children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children || <Outlet />;
}
