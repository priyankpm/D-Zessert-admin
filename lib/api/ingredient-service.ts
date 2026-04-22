import api from './axios-instance';
import { ApiResponse } from './types';

export interface Ingredient {
  id: string;
  name: string;
  isActive?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIngredientDto {
  name: string;
}

class IngredientServiceClass {
  async findAll(): Promise<Ingredient[]> {
    try {
      const response = await api.get<ApiResponse<Ingredient[]>>('/admin/ingredients');
      return response.data.data;
    } catch (error) {
      console.error('[IngredientService] Failed to fetch ingredients:', error);
      throw error;
    }
  }

  async create(data: CreateIngredientDto): Promise<Ingredient> {
    try {
      const response = await api.post<ApiResponse<Ingredient>>('/admin/ingredients', data);
      return response.data.data;
    } catch (error) {
      console.error('[IngredientService] Failed to create ingredient:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateIngredientDto>): Promise<Ingredient> {
    try {
      const response = await api.patch<ApiResponse<Ingredient>>(`/admin/ingredients/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('[IngredientService] Failed to update ingredient:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/admin/ingredients/${id}`);
    } catch (error) {
      console.error('[IngredientService] Failed to delete ingredient:', error);
      throw error;
    }
  }
}

export const IngredientService = new IngredientServiceClass();
