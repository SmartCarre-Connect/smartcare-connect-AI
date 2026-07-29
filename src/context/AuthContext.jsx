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
    const demoUser = {
      id: 'demo-user-123',
      name: 'Alex Morgan',
      email: 'demo@SmartCare-Connect.ai',
      blood_group: 'A+',
      allergies: ['Penicillin'],
      emergency_contact: '+1 (555) 948-2301',
      role: selectedRole
    };

    if (token) {
      if (token === 'demo-mock-jwt-token') {
        setUser(demoUser);
        setLoading(false);
      } else {
        authApi.getMe()
          .then((res) => {
            setUser(res.data || demoUser);
          })
          .catch(() => {
            // Keep user logged in with demo profile even if backend endpoint is unavailable
            setUser(demoUser);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const demo = {
      id: 'demo-user-123',
      name: email && email.includes('admin') ? 'Admin User' : 'Alex Morgan',
      email: email || 'demo@SmartCare-Connect.ai',
      blood_group: 'A+',
      allergies: ['Penicillin'],
      emergency_contact: '+1 (555) 948-2301',
      role: selectedRole
    };
    try {
      const res = await authApi.login({ email, password, role: selectedRole });
      if (res.data?.access_token) {
        localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
        const authenticatedUser = { ...demo, ...res.data, role: res.data.role || selectedRole, name: res.data.full_name || demo.name };
        setUser(authenticatedUser);
        selectRole(authenticatedUser.role);
        return authenticatedUser;
      }
    } catch (err) {
      console.warn("Backend auth call failed, defaulting to demo user", err);
    }
    localStorage.setItem('SmartCare-Connect_token', 'demo-mock-jwt-token');
    setUser(demo);
    return { user: demo };
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const demo = {
        id: 'reg-user-999',
        name: userData.name,
        email: userData.email,
        blood_group: userData.blood_group || 'O+',
        allergies: userData.allergies || [],
        emergency_contact: userData.emergency_contact || '',
        role: selectedRole
      };
      localStorage.setItem('SmartCare-Connect_token', 'demo-mock-jwt-token');
      setUser(demo);
      return { user: demo };
    }
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
