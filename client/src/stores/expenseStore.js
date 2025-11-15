import {create} from 'zustand';
import api from '../api/apiClient';
import { useUiStore } from './uiStore';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  fetchExpenses: async (month) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/expenses', { params: { month }});
      set({ expenses: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err?.message, loading: false });
      throw err;
    }
  },
  addExpense: async (expensePayload) => {
    const tempId = `temp-${Date.now()}`;
    const tempExpense = { _id: tempId, ...expensePayload, createdAt: new Date().toISOString() };
    set((s) => ({ expenses: [tempExpense, ...s.expenses] }));

    try {
      const { data } = await api.post('/expenses', expensePayload);
      set((s) => ({ expenses: s.expenses.map(e => e._id === tempId ? data.expense : e) }));
      const ui = useUiStore.getState();
      if (data.status === 'OVER_BUDGET') {
        ui.showToast({ type: 'error', message: `Added — Over budget by ${Math.abs(data.budget.remaining)}` });
      } else {
        ui.showToast({ type: 'success', message: 'Expense added' });
      }
      return data;
    } catch (err) {
      set((s) => ({ expenses: s.expenses.filter(e => e._id !== tempId) }));
      useUiStore.getState().showToast({ type: 'error', message: err?.response?.data?.message || 'Failed to add expense' });
      throw err;
    }
  },
  deleteExpense: async (id) => {
    const prev = get().expenses;
    set((s) => ({ expenses: s.expenses.filter(e => e._id !== id) }));
    try {
      await api.delete(`/expenses/${id}`);
      return true;
    } catch (err) {
      set({ expenses: prev });
      throw err;
    }
  }
}));
