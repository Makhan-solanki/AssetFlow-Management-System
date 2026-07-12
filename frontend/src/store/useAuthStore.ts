import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'ADMIN';
  departmentId: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: message, loading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      set({ loading: false });
      return response.data.data.code;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed.';
      set({ error: message, loading: false });
      return null;
    }
  },

  verifyEmail: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed.';
      set({ error: message, loading: false });
      return false;
    }
  },

  forgotPassword: async (email, newPassword) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email, newPassword });
      set({ loading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Reset failed.';
      set({ error: message, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.data, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

