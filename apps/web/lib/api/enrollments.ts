import { api } from './client';
import { Enrollment, EnrollmentStatus } from '@/types/academic';

export interface CreateEnrollmentInput {
  studentId: string;
  courseId: string;
}

export interface UpdateEnrollmentInput {
  status?: EnrollmentStatus;
}

export const enrollmentsApi = {
  getAll: async (): Promise<Enrollment[]> => {
    return api.get<Enrollment[]>('/enrollments');
  },

  getById: async (id: string): Promise<Enrollment> => {
    return api.get<Enrollment>(`/enrollments/${id}`);
  },

  create: async (data: CreateEnrollmentInput): Promise<Enrollment> => {
    return api.post<Enrollment>('/enrollments', data);
  },

  update: async (id: string, data: UpdateEnrollmentInput): Promise<Enrollment> => {
    return api.patch<Enrollment>(`/enrollments/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/enrollments/${id}`);
  },
};
