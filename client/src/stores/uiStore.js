import { create } from "zustand";
export const useUiStore = create((set) => ({
  isExpenseModalOpen: false,
  toast: null,
  openExpenseModal: () => set({ isExpenseModalOpen: true }),
  closeExpenseModal: () => set({ isExpenseModalOpen: false }),
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set({ toast: null }), 3500);
  },
}));
