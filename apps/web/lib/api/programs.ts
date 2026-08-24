import { api } from './client';
import { Program } from '@/types/academic';

export interface CreateProgramInput {
  departmentId: string;
  name: string;
  code: string;
  degree?: string;
  durationYears?: number;
  description?: string;
}

export interface UpdateProgramInput {
  departmentId?: string;
  name?: string;
  code?: string;
  degree?: string;
  durationYears?: number;
  description?: string;
  isActive?: boolean;
}

export const programsApi = {
  getAll: async (): Promise<Program[]> => {
    return api.get<Program[]>('/programs');
  },

  getById: async (id: string): Promise<Program> => {
    return api.get<Program>(`/programs/${id}`);
  },

  create: async (data: CreateProgramInput): Promise<Program> => {
    return api.post<Program>('/programs', data);
  },

  update: async (id: string, data: UpdateProgramInput): Promise<Program> => {
    return api.patch<Program>(`/programs/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/programs/${id}`);
  },
};
