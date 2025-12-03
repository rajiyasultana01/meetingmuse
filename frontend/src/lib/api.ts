import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data: { displayName?: string; photoURL?: string }) =>
    api.put('/auth/profile', data),
};

// Meetings API
export const meetingsAPI = {
  upload: (formData: FormData) =>
    api.post('/meetings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: { status?: string; source?: string; limit?: number; offset?: number }) =>
    api.get('/meetings', { params }),
  getById: (id: string) => api.get(`/meetings/${id}`),
  delete: (id: string) => api.delete(`/meetings/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/users', { params }),
  getMeetings: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/admin/meetings', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  updateUserRole: (userId: string, role: 'user' | 'admin') =>
    api.put(`/admin/users/${userId}/role`, { role }),
};

export default api;
