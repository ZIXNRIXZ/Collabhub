import React, { createContext, useContext, useState, useEffect } from 'react';
import { trpc } from './trpc';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('auth-token');
    if (token) {
      // You could verify the token here
      const userData = localStorage.getItem('user-data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.token) {
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('user-data', JSON.stringify(result.user));
        setUser(result.user);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await registerMutation.mutateAsync({ email, password, name });
      if (result.token) {
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('user-data', JSON.stringify(result.user));
        setUser(result.user);
        toast({
          title: "Registration successful",
          description: "Welcome to CollabHub!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 