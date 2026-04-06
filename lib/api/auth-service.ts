import api from './axios-instance';

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    role: string;
  };
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
