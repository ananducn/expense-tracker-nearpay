// src/stores/uiStore.js
import { create } from "zustand";

export const useUiStore = create((set) => ({
  isExpenseModalOpen: false,
  openExpenseModal: () => set({ isExpenseModalOpen: true }),
  closeExpenseModal: () => set({ isExpenseModalOpen: false }),
  // simple toast shape: { type: 'success'|'error', message: string }
  toast: null,
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set({ toast: null }), 3500);
  },
}));
