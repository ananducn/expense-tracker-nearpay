// src/components/EditExpenseModal.jsx
import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useExpenseStore } from "../stores/expenseStore";
import { useUiStore } from "../stores/uiStore";

export default function EditExpenseModal({ expense, onClose }) {
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const showToast = useUiStore((s) => s.showToast);

  const today = new Date().toISOString().slice(0, 10);

  const [categoryId, setCategoryId] = useState(expense?.category?._id ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [date, setDate] = useState(
    expense ? new Date(expense.date).toISOString().slice(0, 10) : today
  );
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetchCategories().catch(() => {});
    }
  }, []);

  useEffect(() => {
    setCategoryId(expense?.category?._id ?? "");
    setAmount(expense?.amount ?? "");
    setDate(
      expense ? new Date(expense.date).toISOString().slice(0, 10) : today
    );
    setNotes(expense?.notes ?? "");
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const amountNum = Number(amount);
    if (!categoryId) return setError("Please select a category");
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0)
      return setError("Please enter a valid amount greater than 0");

    setSaving(true);
    try {
      const payload = {
        category: categoryId,
        amount: amountNum,
        date,
        notes,
      };
      await updateExpense(expense._id, payload);
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Update failed";
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Edit Expense</h3>
            <p className="text-sm text-slate-500">Update the expense details</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
