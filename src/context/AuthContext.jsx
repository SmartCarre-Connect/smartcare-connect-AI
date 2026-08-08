import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext();

const TOKEN_KEY = "SmartCare-Connect_token";
const USER_KEY = "SmartCare-Connect_user";
const ROLE_KEY = "SmartCare-Connect_selected_role";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRoleState] = useState(
    localStorage.getItem(ROLE_KEY) || "patient"
  );

  const selectRole = useCallback((role) => {
    if (!role || typeof role !== "string") return;
    setSelectedRoleState((prevRole) => {
      if (prevRole === role) return prevRole;
      localStorage.setItem(ROLE_KEY, role);
      return role;
    });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          setLoading(false);
          return;
        }

        if (token.startsWith("demo-token-")) {
          try {
            const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
            if (savedUser && savedUser.id) {
              setUser(savedUser);
              selectRole(savedUser.role || "patient");
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              localStorage.removeItem(ROLE_KEY);
              setUser(null);
            }
          } catch (err) {
            console.error("Failed to restore demo session:", err);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(ROLE_KEY);
            setUser(null);
          }
          setLoading(false);
          return;
        }

        try {
          const res = await authApi.getMe();
          const profile = res.data;
          setUser(profile);
          if (profile?.role) {
            selectRole(profile.role);
          }
        } catch (error) {
          console.warn("Session restore failed, clearing auth");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(ROLE_KEY);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [selectRole]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (
      normalizedEmail === "demo@smartcare.ai" &&
      normalizedPassword === "Demo@123"
    ) {
      const demoUser = {
        id: "demo-patient-001",
        name: "Demo Patient",
        full_name: "Demo Patient",
        email: "demo@smartcare.ai",
        role: "patient",
      };

      const demoToken = "demo-token-" + Date.now();

      localStorage.setItem(TOKEN_KEY, demoToken);
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(ROLE_KEY, "patient");

      setUser(demoUser);
      selectRole("patient");

      return demoUser;
    }

    const response = await authApi.login({
      email: normalizedEmail,
      password: normalizedPassword,
      role: selectedRole,
    });

    if (!response?.data?.access_token) {
      throw new Error("Login failed");
    }

    localStorage.setItem(TOKEN_KEY, response.data.access_token);

    let profile;
    try {
      const meRes = await authApi.getMe();
      profile = meRes.data;
    } catch (err) {
      profile = {
        id: response.data.user_id,
        name: response.data.full_name || normalizedEmail,
        full_name: response.data.full_name || normalizedEmail,
        email: normalizedEmail,
        role: response.data.role || selectedRole,
      };
    }

    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    selectRole(profile.role || "patient");

    return profile;
  }, [selectedRole, selectRole]);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);

    if (!response?.data?.access_token) {
      throw new Error("Registration failed");
    }

    localStorage.setItem(TOKEN_KEY, response.data.access_token);

    let profile;
    try {
      const meRes = await authApi.getMe();
      profile = meRes.data;
    } catch (err) {
      profile = {
        id: response.data.user_id,
        name: response.data.full_name,
        full_name: response.data.full_name,
        email: data.email,
        role: response.data.role || "patient",
      };
    }

    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    selectRole(profile.role || "patient");

    return profile;
  }, [selectRole]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    setPermissions([]);
    setUser(null);
    setSelectedRoleState("patient");
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    } catch (err) {
      const updated = {
        ...user,
        ...data,
      };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }, [user]);

  const value = {
    user,
    loading,
    selectedRole,
    permissions,
    login,
    register,
    logout,
    selectRole,
    setPermissions,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
