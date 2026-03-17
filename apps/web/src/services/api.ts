import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Xatolik yuz berdi';

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Show toast for other errors
    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),

  superAdminLogin: (email: string, password: string) =>
    api.post('/auth/super-admin/login', { email, password }),

  me: () => api.get('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  logout: () => api.post('/auth/logout'),
};

// Menu Items API
export const menuItemsApi = {
  getAll: (params?: { category?: string; isActive?: boolean }) =>
    api.get('/menu-items', { params }),

  getById: (id: string) => api.get(`/menu-items/${id}`),

  create: (data: { name: string; price: number; category: string; image?: string }) =>
    api.post('/menu-items', data),

  update: (id: string, data: Partial<{ name: string; price: number; category: string; image: string; isActive: boolean }>) =>
    api.patch(`/menu-items/${id}`, data),

  delete: (id: string) => api.delete(`/menu-items/${id}`),

  reorder: (items: { id: string; sortOrder: number }[]) =>
    api.post('/menu-items/reorder', { items }),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/menu-items/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Rooms API
export const roomsApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/rooms', { params }),

  getById: (id: string) => api.get(`/rooms/${id}`),

  create: (data: { name: string }) => api.post('/rooms', data),

  update: (id: string, data: Partial<{ name: string; isActive: boolean }>) =>
    api.patch(`/rooms/${id}`, data),

  delete: (id: string) => api.delete(`/rooms/${id}`),
};

// Waiters API
export const waitersApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/waiters', { params }),

  getById: (id: string) => api.get(`/waiters/${id}`),

  create: (data: { name: string; phone: string; password: string; commissionPercent?: number }) =>
    api.post('/waiters', data),

  update: (id: string, data: Partial<{ name: string; phone: string; password: string; commissionPercent: number; isActive: boolean }>) =>
    api.patch(`/waiters/${id}`, data),

  getStats: (id: string, params?: { from?: string; to?: string }) =>
    api.get(`/waiters/${id}/stats`, { params }),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { status?: string; roomId?: string; waiterId?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  getCurrentForRoom: (roomId: string) =>
    api.get(`/orders/room/${roomId}/current`),

  getOrCreateForRoom: (roomId: string) =>
    api.post(`/orders/room/${roomId}/get-or-create`),

  create: (data: { roomId: string; items?: { menuItemId: string; quantity: number }[]; clientId?: string }) =>
    api.post('/orders', data),

  update: (id: string, data: { items: { menuItemId: string; quantity: number }[] }) =>
    api.patch(`/orders/${id}`, data),

  close: (id: string) => api.post(`/orders/${id}/close`),

  cancel: (id: string, reason: string) =>
    api.post(`/orders/${id}/cancel`, { reason }),

  addItem: (id: string, menuItemId: string, quantity?: number) =>
    api.post(`/orders/${id}/add-item`, { menuItemId, quantity }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),

  getRevenue: (params: { from: string; to: string; groupBy?: string }) =>
    api.get('/analytics/revenue', { params }),

  getTopItems: (params: { from: string; to: string; limit?: number }) =>
    api.get('/analytics/top-items', { params }),

  getWaiters: (params: { from: string; to: string }) =>
    api.get('/analytics/waiters', { params }),
};

// Restaurant API
export const restaurantApi = {
  get: () => api.get('/restaurant'),

  update: (data: Partial<{ name: string; phone: string; address: string; settings: object }>) =>
    api.patch('/restaurant', data),

  getStats: () => api.get('/restaurant/stats'),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/restaurant/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Sync API
export const syncApi = {
  push: (operations: { type: string; payload: object; clientId: string; timestamp: number }[]) =>
    api.post('/sync/orders', { operations }),

  pull: (lastSyncAt?: number) =>
    api.get('/sync/pull', { params: { lastSyncAt } }),
};

// Super Admin API
export const superAdminApi = {
  getRestaurants: (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) =>
    api.get('/super-admin/restaurants', { params }),

  getRestaurant: (id: string) => api.get(`/super-admin/restaurants/${id}`),

  createRestaurant: (data: {
    name: string;
    slug: string;
    phone: string;
    address?: string;
    adminName: string;
    adminPhone: string;
    adminPassword: string;
    plan: string;
    commissionEnabled?: boolean;
    defaultCommission?: number;
    createSampleData?: boolean;
  }) => api.post('/super-admin/restaurants', data),

  updateRestaurant: (id: string, data: object) =>
    api.patch(`/super-admin/restaurants/${id}`, data),

  deleteRestaurant: (id: string) =>
    api.delete(`/super-admin/restaurants/${id}`),

  updateAdmin: (restaurantId: string, data: { name?: string; phone?: string }) =>
    api.patch(`/super-admin/restaurants/${restaurantId}/admin`, data),

  resetAdminPassword: (id: string, newPassword: string) =>
    api.post(`/super-admin/restaurants/${id}/reset-admin-password`, { newPassword }),

  getStats: () => api.get('/super-admin/stats'),
};
