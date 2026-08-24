import { api } from './client';
import { Course } from '@/types/academic';

export interface CreateCourseInput {
  departmentId: string;
  programId: string;
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  semester?: number;
  yearLevel?: number;
}

export interface UpdateCourseInput {
  departmentId?: string;
  programId?: string;
  code?: string;
  name?: string;
  description?: string;
  creditHours?: number;
  semester?: number;
  yearLevel?: number;
  isActive?: boolean;
}

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    return api.get<Course[]>('/courses');
  },

  getById: async (id: string): Promise<Course> => {
    return api.get<Course>(`/courses/${id}`);
  },

  create: async (data: CreateCourseInput): Promise<Course> => {
    return api.post<Course>('/courses', data);
  },

  update: async (id: string, data: UpdateCourseInput): Promise<Course> => {
    return api.patch<Course>(`/courses/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/courses/${id}`);
  },
};
