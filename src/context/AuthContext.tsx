"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  initialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (t) setToken(t);
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch (e) {
          console.warn("Failed to parse stored user", e);
          setUser(null);
        }
      }
    } finally {
      setInitialized(true);
    }
  }, []);

  const login = (t: string, u: User) => {
    try {
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
    } catch (e) {
      console.warn("Failed to persist auth to localStorage", e);
    }
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      console.warn("Failed to remove auth from localStorage", e);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, initialized, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
