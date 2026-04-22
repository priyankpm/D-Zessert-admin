import api from './axios-instance';
import { ApiResponse } from './types';

export interface Chef {
  id: string;
  name: string;
  shortInfo?: string;
  image?: string;
  verified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChefDto {
  name: string;
  shortInfo?: string;
  image?: File | string;
  verified?: boolean;
}

/**
 * Chef Service
 * 
 * Handles all chef-related API calls with robust type safety.
 */
class ChefServiceClass {
  /**
   * Fetch all chefs
   */
  async findAll(): Promise<Chef[]> {
    try {
      const response = await api.get<ApiResponse<Chef[]>>('/admin/chefs');
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch chefs');
      throw error;
    }
  }

  /**
   * Fetch a single chef by its unique identifier
   */
  async findOne(id: string): Promise<Chef> {
    try {
      const response = await api.get<ApiResponse<Chef>>(`/admin/chefs/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Failed to fetch chef with ID: ${id}`);
      throw error;
    }
  }

  /**
   * Create a new chef मास्टरपीस
   */
  async create(formData: FormData): Promise<Chef> {
    try {
      const response = await api.post<ApiResponse<Chef>>('/admin/chefs/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to create chef');
      throw error;
    }
  }

  /**
   * Update an existing chef's details
   */
  async update(id: string, formData: FormData): Promise<Chef> {
    try {
      const response = await api.patch<ApiResponse<Chef>>(`/admin/chefs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Failed to update chef with ID: ${id}`);
      throw error;
    }
  }

  /**
   * Remove a chef (soft delete)
   */
  async remove(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/admin/chefs/${id}`);
    } catch (error) {
      this.handleError(error, `Failed to delete chef with ID: ${id}`);
      throw error;
    }
  }



  /**
   * Centralized error handler for logging
   */
  private handleError(error: unknown, fallbackMessage: string) {
    console.error(`[ChefService] ${fallbackMessage}:`, error);
  }
}

export const ChefService = new ChefServiceClass();
