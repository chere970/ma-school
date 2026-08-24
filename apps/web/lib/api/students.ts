import { api } from './client';
import { Student } from '@/types/academic';

export interface CreateStudentInput {
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  admissionYear: number;
  yearLevel: number;
  programId: string;
}

export interface UpdateStudentInput {
  studentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  admissionYear?: number;
  yearLevel?: number;
  programId?: string;
  isActive?: boolean;
}

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    return api.get<Student[]>('/students');
  },

  getById: async (id: string): Promise<Student> => {
    return api.get<Student>(`/students/${id}`);
  },

  create: async (data: CreateStudentInput): Promise<Student> => {
    return api.post<Student>('/students', data);
  },

  update: async (id: string, data: UpdateStudentInput): Promise<Student> => {
    return api.patch<Student>(`/students/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/students/${id}`);
  },
};
