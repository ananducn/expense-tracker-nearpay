import { create } from "zustand";
import api from "../api/apiClient";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  setAuth: (user) => set({ user, error: null }),

  signup: async ({name, email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/signup", { email, password });
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
      set({ user: data.user, loading: false }); // token is already in cookie
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
      await api.post("/auth/logout"); // clears cookie on server
    } catch (e) {
      console.log("Logout error:", e);
    }
    set({ user: null });
  },
}));
