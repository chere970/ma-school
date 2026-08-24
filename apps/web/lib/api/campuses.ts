import { api } from './client';
import { Campus } from '@/types/academic';

export interface CreateCampusInput {
  name: string;
  code: string;
  address?: string;
}

export interface UpdateCampusInput {
  name?: string;
  code?: string;
  address?: string;
  isActive?: boolean;
}

export const campusesApi = {
  getAll: async (): Promise<Campus[]> => {
    return api.get<Campus[]>('/campuses');
  },

  getById: async (id: string): Promise<Campus> => {
    return api.get<Campus>(`/campuses/${id}`);
  },

  create: async (data: CreateCampusInput): Promise<Campus> => {
    return api.post<Campus>('/campuses', data);
  },

  update: async (id: string, data: UpdateCampusInput): Promise<Campus> => {
    return api.patch<Campus>(`/campuses/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/campuses/${id}`);
  },
};
