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

    // ========================================
    // PRESENTATION MODE - REMOVE AFTER DEMO
    // ========================================
    // Check if this is a demo token (demo login)
    const isDemoToken = token.includes('demo-signature-');

    if (isDemoToken) {
      // Use stored demo user data
      const storedUser = localStorage.getItem('SmartCare-Connect_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse demo user:', e);
        }
      }
    }
    // ========================================
    // END PRESENTATION MODE
    // ========================================

    // If a token exists, validate it by fetching current user profile (real backend)
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
    // PRESENTATION DEMO MODE: Check for demo credentials and skip backend entirely
    const isDemoCredentials = 
      (email === 'demo@smartcare.ai' || email === 'demo@SmartCare-Connect.ai') && 
      password === 'Demo@123';

    if (isDemoCredentials) {
      // 🎭 PRESENTATION MODE - No API call, instant local login
      console.log('✅ Presentation Demo Mode: Instant local login activated');

      // Create local demo session
      const demoToken = 'demo-token-' + Date.now();
      const demoUser = {
        id: 'demo-patient-001',
        name: 'Demo Patient',
        email: 'demo@smartcare.ai',
        role: 'patient'
      };

      // Store session in localStorage (no backend needed)
      localStorage.setItem('SmartCare-Connect_token', demoToken);
      localStorage.setItem('SmartCare-Connect_selected_role', 'patient');

      // Update React state
      setUser(demoUser);
      selectRole('patient');

      return demoUser;
    }

    // REAL LOGIN: Call backend for actual credentials
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
      // Backend failed - re-throw so UI can show error
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
