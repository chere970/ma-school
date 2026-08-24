import { api } from './client';
import { Department } from '@/types/academic';

export interface CreateDepartmentInput {
  campusId: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentInput {
  campusId?: string;
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    return api.get<Department[]>('/departments');
  },

  getById: async (id: string): Promise<Department> => {
    return api.get<Department>(`/departments/${id}`);
  },

  create: async (data: CreateDepartmentInput): Promise<Department> => {
    return api.post<Department>('/departments', data);
  },

  update: async (id: string, data: UpdateDepartmentInput): Promise<Department> => {
    return api.patch<Department>(`/departments/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/departments/${id}`);
  },
};
