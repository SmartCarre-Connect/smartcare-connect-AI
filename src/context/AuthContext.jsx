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

    // Check if this is a demo token (presentation/demo login)
    const isDemoToken = typeof token === 'string' && token.startsWith('demo-');

    if (isDemoToken) {
      // Use stored demo user data (saved during demo login)
      const storedUser = localStorage.getItem('SmartCare-Connect_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Loaded demo user from localStorage:', parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse demo user:', e);
          setLoading(false);
          return;
        }
      }
      // If no stored user, still mark loading as false
      console.warn('Demo token found but no stored user');
      setLoading(false);
      return;
    }

    // Production mode: validate real token with backend
    authApi.getMe()
      .then((res) => {
        setUser(res.data || null);
      })
      .catch(() => {
        localStorage.removeItem('SmartCare-Connect_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    const demoCredentials =
      (normalizedEmail === 'demo@smartcare.ai' || normalizedEmail === 'demo@SmartCare-Connect.ai') &&
      normalizedPassword === 'Demo@123';

    try {
      const res = await authApi.login({
        email: normalizedEmail,
        password: normalizedPassword,
        role: selectedRole,
      });

      if (res?.data?.access_token) {
        localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
        const profile = await authApi.getMe().then((r) => r.data).catch(() => null);
        const authenticatedUser = profile || {
          id: res.data.user_id || null,
          name: res.data.full_name || email,
          email: res.data.email || normalizedEmail,
          role: res.data.role || selectedRole,
        };

        localStorage.setItem('SmartCare-Connect_user', JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        selectRole(authenticatedUser.role || selectedRole || 'patient');

        if (demoCredentials) {
          localStorage.setItem('SmartCare-Connect_selected_role', 'patient');
        }

        return authenticatedUser;
      }

      throw new Error('Login failed');
    } catch (error) {
      throw error;
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
    localStorage.removeItem('SmartCare-Connect_user');
    localStorage.removeItem('SmartCare-Connect_selected_role');
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
