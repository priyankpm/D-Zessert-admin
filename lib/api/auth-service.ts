import api from './axios-instance';
import { User } from './types';

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const AuthService = {
  sendOtp: async (phone: string): Promise<SendOtpResponse> => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  verifyOtp: async (phone: string, code: string, role?: string): Promise<VerifyOtpResponse> => {
    const response = await api.post('/auth/verify-otp', { phone, code, role });
    return response.data.data;
  },
};
