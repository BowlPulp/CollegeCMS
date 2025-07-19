import { create } from 'zustand';
import axios from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/staff/login', { identifier, password });
      set({ user: res.data.data.staff, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/staff/register', payload);
      set({ user: res.data.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post('/api/auth/staff/logout');
      set({ user: null, loading: false, error: null });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Logout failed', loading: false, user: null });
      throw err;
    }
  },

  restoreSession: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/auth/staff/me');
      set({ user: res.data.data, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
}));

// Restore session on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().restoreSession();
}

export default useAuthStore; 