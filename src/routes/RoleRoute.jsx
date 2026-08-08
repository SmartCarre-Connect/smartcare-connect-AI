import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from './rolePermissions';
import { roleHome } from '../utils/rbac';

export default function RoleRoute({ allowedRoles, permission, redirectTo = '/welcome', children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <div className="text-sm">Checking permissions...</div>
        </div>
      </div>
    );
  }

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
