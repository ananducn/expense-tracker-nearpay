// src/stores/expenseStore.js
import { create } from "zustand";
import api from "../api/apiClient";
import { useUiStore } from "./uiStore";

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  // fetch by month (existing endpoint)
  fetchExpenses: async (month) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/expenses/getExpenses", {
        params: { month },
      });
      set({ expenses: data, loading: false });
      return data;
    } catch (err) {
      set({
        error: err?.message || err?.response?.data?.message,
        loading: false,
      });
      throw err;
    }
  },

  updateExpense: async (id, payload) => {
    set({ loading: true });
    try {
      const { data } = await api.put(`/expenses/updateExpense/${id}`, payload);
      const updated = data?.expense ?? data;
      set((s) => ({
        expenses: s.expenses.map((e) =>
          String(e._id) === String(id) ? updated : e
        ),
        loading: false,
      }));

      const ui = useUiStore.getState();
      ui.showToast({ type: "success", message: "Expense updated" });
      return data;
    } catch (err) {
      set({ loading: false });
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
      useUiStore.getState().showToast({ type: "error", message: msg });
      throw err;
    }
  },

  fetchExpensesRange: async (start, end) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/expenses/range", {
        params: { start, end },
      });
      set({ expenses: data, loading: false });
      return data;
    } catch (err) {
      set({
        error: err?.message || err?.response?.data?.message,
        loading: false,
      });
      throw err;
    }
  },

  addExpense: async (expensePayload) => {
    const tempId = `temp-${Date.now()}`;
    const tempExpense = {
      _id: tempId,
      ...expensePayload,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ expenses: [tempExpense, ...s.expenses] }));

    try {
      const { data } = await api.post("/expenses/addExpense", expensePayload);
      const saved = data?.expense ?? data;
      set((s) => ({
        expenses: s.expenses.map((e) => (e._id === tempId ? saved : e)),
      }));

      const ui = useUiStore.getState();
      if (data?.status === "OVER_BUDGET") {
        ui.showToast({
          type: "error",
          message: `Added — Over budget by ${Math.abs(
            data.budget?.remaining ?? 0
          )}`,
        });
      } else {
        ui.showToast({
          type: "success",
          message: data?.message ?? "Expense added",
        });
      }
      return data;
    } catch (err) {
      set((s) => ({ expenses: s.expenses.filter((e) => e._id !== tempId) }));
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add expense";
      useUiStore.getState().showToast({ type: "error", message: serverMsg });
      throw err;
    }
  },

  deleteExpense: async (id) => {
    const prev = get().expenses;
    set((s) => ({ expenses: s.expenses.filter((e) => e._id !== id) }));
    try {
      await api.delete(`/expenses/deleteExpense/${id}`);
      return true;
    } catch (err) {
      set({ expenses: prev });
      throw err;
    }
  },
}));
