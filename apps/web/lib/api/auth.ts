import { api } from './client';
import { AuthResponse, LoginCredentials, Tenant } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials, tenantId?: string): Promise<AuthResponse> => {
    const headers: Record<string, string> = {};
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    return api.post<AuthResponse>('/auth/login', credentials, { headers });
  },

  logout: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return api.post('/auth/refresh', { refreshToken });
  },

  getCurrentTenant: async (): Promise<Tenant> => {
    return api.get<Tenant>('/tenants/current');
  },
};
