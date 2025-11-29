import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { 
  User, 
  LoginCredentials, 
  ForgotPasswordData, 
  ResetPasswordData 
} from '@/types';

// Create axios instance configured for Laravel Sanctum
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Required for Sanctum cookie-based authentication
  withXSRFToken: true,
});

// Get CSRF cookie from Laravel Sanctum
export const getCsrfCookie = async (): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
};

// Auth API functions
export const authApi = {
  // Get current authenticated user
  getUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/user');
    return response.data;
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<void> => {
    await getCsrfCookie();
    await api.post('/login', credentials);
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  // Request password reset email
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await getCsrfCookie();
    await api.post('/forgot-password', data);
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await getCsrfCookie();
    await api.post('/reset-password', data);
  },
};

// Error handler helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      return Object.values(errors).flat().join(', ');
    }
    
    if (axiosError.response?.status === 401) {
      return 'Invalid credentials';
    }
    
    if (axiosError.response?.status === 422) {
      return 'Validation error';
    }
    
    if (axiosError.response?.status === 429) {
      return 'Too many attempts. Please try again later.';
    }
  }
  
  return 'An unexpected error occurred';
};

export default api;
