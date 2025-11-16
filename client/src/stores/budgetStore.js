import {create} from 'zustand';
import api from '../api/apiClient';

export const useBudgetStore = create((set) => ({
  budgets: [],
  loading: false,
  error: null,
  fetchBudgets: async (month) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/budgets/getBudgets', { params: { month }});
      set({ budgets: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err?.message, loading: false });
      throw err;
    }
  },
  upsertBudget: async ({ categoryId, month, limit }) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/budgets/upsertBudget', { categoryId, month, limit });
      set((s) => {
        const exists = s.budgets.find(b => b._id === data._id);
        return { budgets: exists ? s.budgets.map(b => b._id === data._id ? data : b) : [data, ...s.budgets], loading: false };
      });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  deleteBudget: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/budgets/${id}`);
      set((s) => ({ budgets: s.budgets.filter(b => b._id !== id), loading: false }));
      return true;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  }
}));
