import { api } from './client';
import { Timetable } from '@/types/academic';

export interface CreateTimetableInput {
  teachingAssignmentId: string;
  roomId: string;
  dayOfWeek: number;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface UpdateTimetableInput {
  teachingAssignmentId?: string;
  roomId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export const timetableApi = {
  getAll: async (): Promise<Timetable[]> => {
    return api.get<Timetable[]>('/timetables');
  },

  getById: async (id: string): Promise<Timetable> => {
    return api.get<Timetable>(`/timetables/${id}`);
  },

  create: async (data: CreateTimetableInput): Promise<Timetable> => {
    return api.post<Timetable>('/timetables', data);
  },

  update: async (id: string, data: UpdateTimetableInput): Promise<Timetable> => {
    return api.patch<Timetable>(`/timetables/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/timetables/${id}`);
  },
};
