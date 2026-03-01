import React, { createContext, useContext, useState, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { InsertUser } from "@shared/schema";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: any;
  register: any;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();   // ✅ correct Wouter navigation
  const [user, setUser] = useState<User | null>(null);

  /* ================= LOGIN ================= */
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      return data;
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.name}`,
      });
      navigate("/dashboard");   // ✅
    },
  });

  /* ================= REGISTER ================= */
  const register = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Registration failed");

      return result;
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      toast({
        title: "Account created!",
        description: `Welcome ${userData.name}`,
      });
      navigate("/dashboard");   // ✅
    },
  });

  const logout = () => {
    setUser(null);
    navigate("/");   // ✅
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}