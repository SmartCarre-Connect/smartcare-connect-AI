import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();
const roleKey = 'SmartCare-Connect_selected_role';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem(roleKey) || 'patient');
  const [permissions, setPermissions] = useState([]);

  const selectRole = (role) => {
    localStorage.setItem(roleKey, role);
    setSelectedRole(role);
    setPermissions([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('SmartCare-Connect_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // If a token exists, validate it by fetching current user profile.
    authApi.getMe()
      .then((res) => {
        setUser(res.data || null);
      })
      .catch(() => {
        // Token invalid or backend unreachable: clear token and reset user.
        localStorage.removeItem('SmartCare-Connect_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // DEMO MODE: Check for demo credentials first
    const isDemoCredentials = 
      (email === 'demo@smartcare.ai' || email === 'demo@SmartCare-Connect.ai') && 
      password === 'Demo@123';

    if (isDemoCredentials) {
      // Presentation Demo Login - bypass backend
      console.log('✅ Presentation Demo Mode Activated');
      localStorage.setItem('SmartCare-Connect_token', 'presentation-demo-token-' + Date.now());
      localStorage.setItem('SmartCare-Connect_selected_role', 'patient');
      const demoUser = {
        id: 'demo-user',
        name: 'Demo User',
        email,
        role: 'patient'
      };
      localStorage.setItem('SmartCare-Connect_user', JSON.stringify(demoUser));
      setUser(demoUser);
      selectRole('patient');
      // Show toast
      if (window.__showToast) {
        window.__showToast('Presentation Demo Mode', 'success');
      }
      return demoUser;
    }

    // Try real backend login
    try {
      const res = await authApi.login({ email, password, role: selectedRole });
      if (res?.data?.access_token) {
        localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
        // Fetch the full profile from the backend to populate user state
        const profile = await authApi.getMe().then((r) => r.data).catch(() => null);
        const authenticatedUser = profile || {
          id: res.data.user_id || null,
          name: res.data.full_name || email,
          email,
          role: res.data.role || selectedRole,
        };
        setUser(authenticatedUser);
        selectRole(authenticatedUser.role);
        return authenticatedUser;
      }
      throw new Error('Login failed');
    } catch (error) {
      // If backend fails (offline, CORS, 404, 500), fall back to demo
      console.log('⚠️ Backend unavailable, enabling Demo Mode fallback:', error.message);
      localStorage.setItem('SmartCare-Connect_token', 'presentation-demo-token-' + Date.now());
      localStorage.setItem('SmartCare-Connect_selected_role', selectedRole);
      const demoUser = {
        id: 'demo-user',
        name: 'Demo User',
        email,
        role: selectedRole
      };
      localStorage.setItem('SmartCare-Connect_user', JSON.stringify(demoUser));
      setUser(demoUser);
      selectRole(selectedRole);
      // Show toast
      if (window.__showToast) {
        window.__showToast('Presentation Demo Mode', 'success');
      }
      return demoUser;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res?.data?.access_token) {
      localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
      const profile = await authApi.getMe().then((r) => r.data).catch(() => null);
      const registeredUser = profile || {
        id: res.data.user_id || 'new-user',
        name: userData.full_name || userData.name || '',
        email: userData.email,
        role: res.data.role || userData.role || selectedRole,
      };
      setUser(registeredUser);
      selectRole(registeredUser.role);
      return res.data;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('SmartCare-Connect_token');
    setUser(null);
  };

  const updateUserProfile = async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data);
    } catch (err) {
      setUser((prev) => ({ ...prev, ...data }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, selectedRole, selectRole, permissions, setPermissions, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
