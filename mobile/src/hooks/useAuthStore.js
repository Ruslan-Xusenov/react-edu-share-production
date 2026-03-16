import { create } from 'zustand';
import { storage } from '../api/client';
import apiClient, { API_ENDPOINTS } from '../api/client';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // App ishga tushganda token tekshirish
  initialize: async () => {
    try {
      const token = await storage.getItem('authToken');
      const userStr = await storage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // Login
  login: async (phone, password) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, { phone, password });
    const { token, user } = response.data;
    await storage.setItem('authToken', token || 'session-active');
    await storage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
    return response.data;
  },

  // Signup
  signup: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch {}
    await storage.removeItem('authToken');
    await storage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Profil yangilash
  refreshProfile: async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (res.data?.user) {
        await storage.setItem('user', JSON.stringify(res.data.user));
        set({ user: res.data.user });
      }
    } catch {}
  },

  // User ma'lumotlarini lokal yangilash
  updateUser: (updatedUser) => {
    storage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
