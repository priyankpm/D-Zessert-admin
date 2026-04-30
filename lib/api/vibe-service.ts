import api from './axios-instance';
import { ApiResponse } from './types';

export interface Vibe {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

class VibeServiceClass {
  async findAll(): Promise<Vibe[]> {
    try {
      // Based on the provided controller, the endpoint is likely /vibes
      // But looking at other services, it might be /admin/vibes
      // I'll try /admin/vibes first as it matches the pattern of other admin services
      const response = await api.get<ApiResponse<Vibe[]>>('/vibes');
      return response.data.data;
    } catch (error) {
      console.error('[VibeService] Failed to fetch vibes:', error);
      throw error;
    }
  }
}

export const VibeService = new VibeServiceClass();
