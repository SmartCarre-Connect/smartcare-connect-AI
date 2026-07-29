import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from './rolePermissions';

export default function RoleRoute({ allowedRoles, permission, redirectTo = '/welcome', children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
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
