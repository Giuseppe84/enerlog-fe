"use client";

import { useContext, useState, ReactNode, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";
import { userAPI } from "@/api/user";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // 🔥 CHECK SESSION AL REFRESH
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await userAPI.getMe(); // chiama /auth/me
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async () => {
    // il cookie viene già settato dal backend
    const res = await userAPI.getMe();
    setUser(res.data);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await userAPI.logout(); // endpoint che cancella cookie
    setUser(null);
    setIsAuthenticated(false);
  };

  // ⏳ evita redirect prematuri
  if (loading) return null; // oppure spinner

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};