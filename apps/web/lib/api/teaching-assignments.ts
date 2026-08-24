import { api } from './client';
import { TeachingAssignment } from '@/types/academic';

export interface CreateTeachingAssignmentInput {
  teacherId: string;
  courseId: string;
}

export interface UpdateTeachingAssignmentInput {
  teacherId?: string;
  courseId?: string;
  isActive?: boolean;
}

export const teachingAssignmentsApi = {
  getAll: async (): Promise<TeachingAssignment[]> => {
    return api.get<TeachingAssignment[]>('/teaching-assignments');
  },

  getById: async (id: string): Promise<TeachingAssignment> => {
    return api.get<TeachingAssignment>(`/teaching-assignments/${id}`);
  },

  create: async (data: CreateTeachingAssignmentInput): Promise<TeachingAssignment> => {
    return api.post<TeachingAssignment>('/teaching-assignments', data);
  },

  update: async (id: string, data: UpdateTeachingAssignmentInput): Promise<TeachingAssignment> => {
    return api.patch<TeachingAssignment>(`/teaching-assignments/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/teaching-assignments/${id}`);
  },
};
