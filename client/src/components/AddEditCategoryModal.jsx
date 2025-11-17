import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useBudgetStore } from "../stores/budgetStore";

/**
 * Add / Edit Category modal
 * - now includes a required Budget Limit input
 * - on create/edit it upserts a budget for the current month using useBudgetStore.upsertBudget
 */
export default function AddEditCategoryModal({ initial = null, onClose }) {
  const isEdit = Boolean(initial && initial._id);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);

  // budget store
  const upsertBudget = useBudgetStore((s) => s.upsertBudget);

  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? "#0ea5e9");
  // budget limit is required now
  const [limit, setLimit] = useState(
    initial?.budgetLimit !== undefined ? String(initial.budgetLimit) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setColor(initial?.color ?? "#0ea5e9");
    setLimit(
      initial?.budgetLimit !== undefined ? String(initial.budgetLimit) : ""
    );
  }, [initial]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name required");

    // budget limit is required and must be numeric >= 0
    if (limit === "" || Number.isNaN(Number(limit))) {
      return setError("Budget limit is required and must be a number");
    }
    const limitNum = Number(limit);
    if (limitNum < 0) return setError("Budget limit cannot be negative");

    setSaving(true);

    try {
      const month = getCurrentMonth();

      if (isEdit) {
        // update category
        const updatedCat = await updateCategory(initial._id, {
          name: name.trim(),
          color,
        });

        // upsert budget for this category & month
        await upsertBudget({
          categoryId: initial._id,
          month,
          limit: limitNum,
        });
      } else {
        // create category
        const created = await addCategory({ name: name.trim(), color });

        // in case addCategory returns temp or real — use returned id
        const categoryId = created._id ?? created.id ?? created;

        // upsert budget for this category & month
        await upsertBudget({
          categoryId,
          month,
          limit: limitNum,
        });
      }

      onClose?.();
    } catch (err) {
      console.error("save category failed", err);
      setError(
        err?.response?.data?.message ?? err?.message ?? "Save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose?.()}
        aria-hidden
      />

      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">
              {isEdit ? "Edit Category" : "Add Category"}
            </h3>
            <p className="text-sm text-slate-500">
              {isEdit ? "Update category details" : "Create a new spending category"}
            </p>
          </div>
          <button onClick={() => onClose?.()} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
              placeholder="e.g. Food, Transport"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-12 p-0 border rounded"
              />
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Pick a color or paste hex (e.g. #0ea5e9)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Budget limit (required)
            </label>
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none"
              placeholder="e.g. 500.00"
            />
            <div className="text-xs text-slate-400 mt-1">
              Budget is created/updated for the current month ({getCurrentMonth()})
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create category")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
