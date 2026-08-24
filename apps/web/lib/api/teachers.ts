import { api } from './client';
import { Teacher } from '@/types/academic';

export interface CreateTeacherInput {
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  hireDate?: string;
  departmentId: string;
}

export interface UpdateTeacherInput {
  employeeNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  hireDate?: string;
  departmentId?: string;
  isActive?: boolean;
}

export const teachersApi = {
  getAll: async (): Promise<Teacher[]> => {
    return api.get<Teacher[]>('/teachers');
  },

  getById: async (id: string): Promise<Teacher> => {
    return api.get<Teacher>(`/teachers/${id}`);
  },

  create: async (data: CreateTeacherInput): Promise<Teacher> => {
    return api.post<Teacher>('/teachers', data);
  },

  update: async (id: string, data: UpdateTeacherInput): Promise<Teacher> => {
    return api.patch<Teacher>(`/teachers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/teachers/${id}`);
  },
};
