'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Tenant, LoginCredentials } from '@/types/auth';
import { authApi } from '../api/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, tenantId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchTenant = async () => {
    try {
      const tenantData = await authApi.getCurrentTenant();
      setTenant(tenantData);
    } catch (err) {
      console.warn('Could not fetch tenant details:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user_info');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          await fetchTenant();
        }
      } catch (e) {
        console.error('Failed to initialize auth state', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials, tenantId);
      
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(response.user));
      
      setUser(response.user);
      
      // Fetch tenant details using authenticated context
      await fetchTenant();

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network/server errors during logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      setUser(null);
      setTenant(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshTenant: fetchTenant,
      }}
    >
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
