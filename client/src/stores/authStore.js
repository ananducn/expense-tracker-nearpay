// src/stores/authStore.js
import { create } from "zustand";
import api from "../api/apiClient";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  authChecked: false,

  setAuth: (user) => set({ user, error: null }),

  // mark initial auth check as done
  markAuthChecked: (val = true) => set({ authChecked: val }),

  signup: async ({ fullName, email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/signup", {
        fullName,
        email,
        password,
      });

      set({ user: data.user, loading: false });
      return data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || err.message,
        loading: false,
      });
      throw err;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      set({ user: data.user, loading: false });
      return data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || err.message,
        loading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.log("Logout error:", e);
    } finally {
      set({ user: null });
    }
  },
}));
