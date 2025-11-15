import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setRole(storedRole);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      setUser(response.data.user);
      setRole(response.data.user.role);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
      setLoading(false);
    }
  };

  const login = (token, userRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setRole(userRole);
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const isAdmin = () => {
    return role === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        refreshUser: fetchProfile,
      }}
    >
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
