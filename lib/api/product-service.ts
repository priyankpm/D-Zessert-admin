import api from './axios-instance';

/**
 * Common API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Product Data Interfaces
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  calories?: number;
  rating: number;
  reviews: number;
  match: number;
  chefName?: string;
  tags: string[];
  imageUrl?: string;
  gallery: string[];
  preferredMood?: string;
  stock: number;
  experienceType?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto extends Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDeleted' | 'rating' | 'reviews'> {
  rating?: number;
  reviews?: number;
  isDeleted?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

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
      const response = await api.get<ApiResponse<Product[]>>('/products');
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
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
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
      const response = await api.post<ApiResponse<Product>>('/products', productData);
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
      const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, productData);
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
      await api.delete<ApiResponse<void>>(`/products/${id}`);
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
      formData.append('file', file);
      const response = await api.post<ApiResponse<string>>('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // response.data.data might be { success: true, url: '...' } based on my controller
      // Wait, my controller returns { success: true, url }
      // So response.data.data is { success: true, url }? 
      // Actually, ApiResponse is { success, message, data }
      // If controller returns { success, url }, NestJS wraps it? No.
      // My Service handles it.
      return (response.data as any).url;
    } catch (error) {
      this.handleError(error, 'Failed to upload image');
      throw error;
    }
  }

  /**
   * Upload multiple showcase images
   */
  async uploadGallery(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      const response = await api.post<ApiResponse<string[]>>('/products/upload-gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return (response.data as any).urls;
    } catch (error) {
      this.handleError(error, 'Failed to upload gallery');
      throw error;
    }
  }

  /**
   * Centralized error handler for logging
   */
  private handleError(error: any, fallbackMessage: string) {
    console.error(`[ProductService] ${fallbackMessage}:`, error);
  }
}

export const ProductService = new ProductServiceClass();
