import { create } from "zustand";
import api from "../api/apiClient";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/categories/getCategories");
      set({ categories: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  addCategory: async (payload) => {
    const tempId = `temp-${Date.now()}`;
    const tempCat = { _id: tempId, ...payload };
    set((s) => ({ categories: [tempCat, ...s.categories] }));
    try {
      const { data } = await api.post("/categories/createCategories", payload);
      set((s) => ({
        categories: s.categories.map((c) => (c._id === tempId ? data : c)),
      }));
      return data;
    } catch (err) {
      set((s) => ({
        categories: s.categories.filter((c) => c._id !== tempId),
      }));
      throw err;
    }
  },
  updateCategory: async (id, payload) => {
    set({ loading: true });
    try {
      const { data } = await api.put(`/categories/updateCategories/${id}`, payload);
      set((s) => ({
        categories: s.categories.map((c) => (c._id === id ? data : c)),
        loading: false,
      }));
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  deleteCategory: async (id) => {
    const prev = get().categories;
    set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
    try {
      await api.delete(`/categories/deleteCategories/${id}`);
      return true;
    } catch (err) {
      set({ categories: prev });
      throw err;
    }
  },
}));
