import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { InsertUser } from "@shared/schema";
import { z } from "zod";

// Create a client-side only auth state simulation for this demo
// In a real app, this would use the session-based /api/me endpoint
let MOCK_USER: { id: number; name: string; email: string } | null = null;

export function useAuth() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      // For demo purposes, we simulate the API call and return mock data
      // In production, this would be:
      // const res = await fetch(api.auth.login.path, { ... });
      // return api.auth.login.responses[200].parse(await res.json());
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
      
      MOCK_USER = {
        id: 1,
        name: "Demo Farmer",
        email: credentials.username || "farmer@demo.com"
      };
      
      return MOCK_USER;
    },
    onSuccess: (user) => {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      MOCK_USER = {
        id: Math.floor(Math.random() * 1000),
        name: data.name || "New Farmer",
        email: data.email
      };
      
      return MOCK_USER;
    },
    onSuccess: (user) => {
      toast({
        title: "Account created!",
        description: `Welcome to Smart Farm, ${user.name}`,
      });
      setLocation("/dashboard");
    },
  });

  const logout = () => {
    MOCK_USER = null;
    toast({ title: "Logged out", description: "See you next time!" });
    setLocation("/");
  };

  return {
    user: MOCK_USER,
    login: loginMutation,
    register: registerMutation,
    logout,
  };
}
