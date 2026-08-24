import { api } from './client';
import { Room } from '@/types/academic';

export interface CreateRoomInput {
  campusId: string;
  name: string;
  code: string;
  capacity: number;
  type?: string;
}

export interface UpdateRoomInput {
  campusId?: string;
  name?: string;
  code?: string;
  capacity?: number;
  type?: string;
  isActive?: boolean;
}

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    return api.get<Room[]>('/rooms');
  },

  getById: async (id: string): Promise<Room> => {
    return api.get<Room>(`/rooms/${id}`);
  },

  create: async (data: CreateRoomInput): Promise<Room> => {
    return api.post<Room>('/rooms', data);
  },

  update: async (id: string, data: UpdateRoomInput): Promise<Room> => {
    return api.patch<Room>(`/rooms/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/rooms/${id}`);
  },
};
