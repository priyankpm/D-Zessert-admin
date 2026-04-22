import api from './axios-instance';
import { ApiResponse } from './types';

export interface Topping {
  id: string;
  name: string;
  price: number;
  isActive?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateToppingDto {
  name: string;
  price: number;
}

class ToppingServiceClass {
  async findAll(): Promise<Topping[]> {
    try {
      const response = await api.get<ApiResponse<Topping[]>>('/admin/toppings');
      return response.data.data;
    } catch (error) {
      console.error('[ToppingService] Failed to fetch toppings:', error);
      throw error;
    }
  }

  async create(data: CreateToppingDto): Promise<Topping> {
    try {
      const response = await api.post<ApiResponse<Topping>>('/admin/toppings', data);
      return response.data.data;
    } catch (error) {
      console.error('[ToppingService] Failed to create topping:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateToppingDto>): Promise<Topping> {
    try {
      const response = await api.patch<ApiResponse<Topping>>(`/admin/toppings/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('[ToppingService] Failed to update topping:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/admin/toppings/${id}`);
    } catch (error) {
      console.error('[ToppingService] Failed to delete topping:', error);
      throw error;
    }
  }
}

export const ToppingService = new ToppingServiceClass();
