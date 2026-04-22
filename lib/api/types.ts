/**
 * Shared API response wrapper used by all services.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  phone: string;
  role: string;
  name?: string;
}
