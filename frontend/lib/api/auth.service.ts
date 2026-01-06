import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name?: string;
      avatar?: string;
      preferences?: {
        defaultCurrency?: string;
        theme?: string;
      };
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: () => apiClient.post('/auth/logout'),

  getCurrentUser: () => apiClient.get('/auth/me'),

  refreshToken: () => apiClient.post('/auth/refresh'),
};
