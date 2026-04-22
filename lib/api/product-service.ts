import api from './axios-instance';
import { ApiResponse } from './types';
export type { ApiResponse };
import { Chef } from './chef-service';
import { Ingredient } from './ingredient-service';
import { Topping } from './topping-service';

/**
 * Product Data Interfaces
 */
export interface ProductRecommendation {
  id: string;
  productId: string;
  recommendedId: string;
  recommended: Product;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  gallery: string[];
  chefsPick?: boolean;
  prepTime?: number;
  calories?: number;
  grade?: string;
  sweetnessLevel?: number;
  ritualTitle?: string;
  ritualSubTitle?: string;
  ritualDescription?: string;
  story?: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  isActive: boolean;
  isDeleted: boolean;
  stock: number;
  chefId?: string;
  chef?: Chef;
  ingredients?: Ingredient[];
  toppings?: Topping[];
  rating?: number;
  reviews?: number;
  recommendations?: ProductRecommendation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  imageUrl?: string;
  gallery?: string[];
  chefsPick?: boolean;
  prepTime?: number;
  calories?: number;
  grade?: string;
  sweetnessLevel?: number;
  ritualTitle?: string;
  ritualSubTitle?: string;
  ritualDescription?: string;
  story?: string;
  price: number;
  discountedPrice?: number;
  currency?: string;
  stock?: number;
  chefId?: string;
  ingredientIds?: string[];
  toppingIds?: string[];
  recommendations?: { recommendedId: string }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isDeleted?: boolean;
}

/**
 * Product Service
 * 
 * Handles all product-related API calls with robust type safety.
 * Extracts data from the standard API response wrapper.
 */
class ProductServiceClass {
  /**
   * Fetch all products from the inventory
   */
  async findAll(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>('admin/products');
      return response.data.data; // Standardly extract data from the wrapper
    } catch (error) {
      this.handleError(error, 'Failed to fetch products');
      throw error;
    }
  }

  /**
   * Fetch a single product by its unique identifier
   */
  async findOne(id: string): Promise<Product> {
    try {
      const response = await api.get<ApiResponse<Product>>(`admin/products/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Failed to fetch product with ID: ${id}`);
      throw error;
    }
  }

  /**
   * Create a new product masterpiece
   */
  async create(productData: CreateProductDto): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>('admin/products', productData);
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to create product');
      throw error;
    }
  }

  /**
   * Update an existing product's details
   */
  async update(id: string, productData: UpdateProductDto): Promise<Product> {
    try {
      const response = await api.patch<ApiResponse<Product>>(`admin/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Failed to update product with ID: ${id}`);
      throw error;
    }
  }

  /**
   * Remove a product from the inventory
   */
  async remove(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`admin/products/${id}`);
    } catch (error) {
      this.handleError(error, `Failed to delete product with ID: ${id}`);
      throw error;
    }
  }

  /**
   * Upload a single product image to the gallery
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<{ url: string }>("admin/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (error) {
      this.handleError(error, "Failed to upload image");
      throw error;
    }
  }

  /**
   * Upload multiple showcase images
   */
  async uploadGallery(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const response = await api.post<{ urls: string[] }>(
        "admin/products/upload-gallery",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.urls;
    } catch (error) {
      this.handleError(error, "Failed to upload gallery");
      throw error;
    }
  }

  /**
   * Centralized error handler for logging
   */
  private handleError(error: unknown, fallbackMessage: string) {
    console.error(`[ProductService] ${fallbackMessage}:`, error);
  }
}

export const ProductService = new ProductServiceClass();
