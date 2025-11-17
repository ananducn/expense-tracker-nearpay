// src/components/AddExpenseModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useUiStore } from "../stores/uiStore";
import { useCategoryStore } from "../stores/categoryStore";
import { useExpenseStore } from "../stores/expenseStore";
import { useBudgetStore } from "../stores/budgetStore";

export default function AddExpenseModal({ categories: categoriesProp }) {
  const isOpen = useUiStore((s) => s.isExpenseModalOpen);
  const close = useUiStore((s) => s.closeExpenseModal);
  const showToast = useUiStore((s) => s.showToast);

  const categoriesFromStore = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  const categories = categoriesProp ?? categoriesFromStore ?? [];

  //
  const addExpenseInStore = useExpenseStore
    ? useExpenseStore((s) => s.createExpense || s.addExpense)
    : null;
  const fetchExpenses = useExpenseStore
    ? useExpenseStore((s) => s.fetchExpenses)
    : null;
  const fetchBudgets = useBudgetStore
    ? useBudgetStore((s) => s.fetchBudgets)
    : null;

  // form state
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // If categories are not loaded, fetch them once when modal opens
  useEffect(() => {
    if (isOpen && (!categories || categories.length === 0)) {
      if (typeof fetchCategories === "function") {
        fetchCategories().catch((e) => {
          console.error("fetchCategories failed:", e);
        });
      }
    }
  }, [isOpen, fetchCategories, categories]);

  // When categories change, set default categoryId if none selected
  useEffect(() => {
    if (
      (!categoryId || categoryId === "") &&
      categories &&
      categories.length > 0
    ) {
      setCategoryId(categories[0]._id);
    }
  }, [categories, categoryId]);

  // Debugging help — remove in production
  useEffect(() => {
    if (isOpen) {
      console.debug("AddExpenseModal opened, categories:", categories);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setAmount("");
    setDate(today);
    setNotes("");
    // keep category selection so user doesn't lose default (optional)
    close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) return setError("Please select a category");
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      return setError("Please enter a valid amount greater than 0");
    }

    setSaving(true);
    try {
      const month = date.slice(0, 7);

      // payload uses `category` (backend expects `category` field)
      const payload = {
        category: categoryId,
        amount: amountNum,
        date,
        month,
        notes,
      };

      if (addExpenseInStore) {
        await addExpenseInStore(payload);
      } else {
        await api.post("/expenses", payload);
      }

      if (typeof fetchExpenses === "function") {
        try {
          await fetchExpenses(month);
        } catch (e) {
          /* ignore */
        }
      }
      if (typeof fetchBudgets === "function") {
        try {
          await fetchBudgets(month);
        } catch (e) {}
      }

      showToast({ type: "success", message: "Expense saved" });
      handleClose();
    } catch (err) {
      console.error("Save expense error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Save failed";
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Add Expense</h3>
            <p className="text-sm text-slate-500">
              Record a new expense and track your spending
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
              placeholder="e.g. lunch at cafe"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
