import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Production API URL
export const BASE_URL = 'https://edushare.uz';
export const API_BASE_URL = `${BASE_URL}/api`;

// SecureStore wrapper (web da localStorage ishlatadi)
export const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — token qo'shish
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('authToken');
    if (token && token !== 'session-active') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 xato
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('authToken');
      await storage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/accounts/login/',
  SIGNUP: '/accounts/signup/',
  LOGOUT: '/accounts/logout/',
  PROFILE: '/accounts/profile/',
  PROFILE_UPDATE: '/accounts/update/',
  CHANGE_PASSWORD: '/accounts/change-password/',
  LEADERBOARD: '/accounts/leaderboard/',
  CATEGORIES: '/categories/',
  SUBCATEGORIES: '/subcategories/',
  LESSONS: '/lessons/',
  LESSON_DETAIL: (id) => `/lessons/${id}/`,
  LESSON_ENROLLED: '/lessons/enrolled/',
  LESSON_SAVED: '/lessons/saved/',
  LESSON_UPDATE_PROGRESS: (id) => `/lessons/${id}/update_progress/`,
  LESSON_COMMENTS: (id) => `/lessons/${id}/comments/`,
  LESSON_ADD_COMMENT: (id) => `/lessons/${id}/add_comment/`,
  LESSON_LIKE: (id) => `/lessons/${id}/like/`,
  LESSON_SAVE: (id) => `/lessons/${id}/save_lesson/`,
  LESSON_ENROLL: (id) => `/lessons/${id}/enroll/`,
  ASSIGNMENTS: '/assignments/',
  ASSIGNMENT_SUBMIT: (id) => `/assignments/${id}/submit/`,
  COMMENTS: '/comments/',
  COMMENT_LIKE: (id) => `/comments/${id}/like/`,
  COMMENT_DISLIKE: (id) => `/comments/${id}/dislike/`,
  CERTIFICATES: '/certificates/',
  CERTIFICATE_DETAIL: (id) => `/certificates/${id}/`,
  QUIZ_QUESTIONS: '/quiz-questions/',
  LESSON_QUIZ: (id) => `/lessons/${id}/quiz/`,
  LESSON_QUIZ_SUBMIT: (id) => `/lessons/${id}/submit_quiz/`,
  AI_CHAT: '/ai-chat/',
  TEAM: '/team/',
  REQUEST_PASSWORD_CHANGE: '/accounts/request-password-change/',
  VERIFY_PASSWORD_OTP: '/accounts/verify-password-otp/',
  RESEND_PASSWORD_OTP: '/accounts/resend-password-otp/',
  GOOGLE_AUTH: '/accounts/google-auth/',
};