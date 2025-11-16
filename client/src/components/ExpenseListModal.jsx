// src/components/ExpenseListModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { useUiStore } from "../stores/uiStore";
import { format } from "date-fns";

export default function ExpenseListModal({
  isOpen,
  onClose,
  categoryId,
  month,
}) {
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const allExpenses = useExpenseStore((s) => s.expenses) || [];
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const showToast = useUiStore((s) => s.showToast);

  const [loading, setLoading] = useState(false);

  // sort mode
  const [sortMode, setSortMode] = useState("amount_desc");

  // filter mode
  const [filterMode, setFilterMode] = useState("all");
  const today = new Date().toISOString().slice(0, 10);

  const [singleDate, setSingleDate] = useState(today);
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState(today);

  const [localExpenses, setLocalExpenses] = useState([]);

  // fetch when opened
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchExpenses(month)
      .catch(() =>
        showToast({ type: "error", message: "Failed to load expenses" })
      )
      .finally(() => setLoading(false));

    setFilterMode("all");
    setSortMode("amount_desc");
    setSingleDate(today);
    setRangeStart(today);
    setRangeEnd(today);
  }, [isOpen, month]);

  // Filter expenses by category
  useEffect(() => {
    if (!isOpen) return;

    const filtered = allExpenses.filter((e) => {
      const cId = e.category?._id ?? e.category;
      return String(cId) === String(categoryId);
    });

    setLocalExpenses(filtered);
  }, [allExpenses, categoryId, isOpen]);

  // Filter by date
  const dateFiltered = useMemo(() => {
    if (filterMode === "all") return localExpenses;

    const toYMD = (d) => new Date(d).toISOString().slice(0, 10);

    if (filterMode === "single") {
      return localExpenses.filter((e) => toYMD(e.date) === singleDate);
    }

    if (filterMode === "range") {
      const s = new Date(rangeStart).setHours(0, 0, 0, 0);
      const e = new Date(rangeEnd).setHours(23, 59, 59, 999);
      if (s > e) return [];
      return localExpenses.filter((exp) => {
        const t = new Date(exp.date).getTime();
        return t >= s && t <= e;
      });
    }

    return localExpenses;
  }, [localExpenses, filterMode, singleDate, rangeStart, rangeEnd]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...dateFiltered];
    switch (sortMode) {
      case "amount_asc":
        arr.sort((a, b) => a.amount - b.amount);
        break;
      case "amount_desc":
        arr.sort((a, b) => b.amount - a.amount);
        break;
      case "date_asc":
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date_desc":
      default:
        arr.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    return arr;
  }, [dateFiltered, sortMode]);

  if (!isOpen) return null;

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      await fetchExpenses(month);
      showToast({ type: "success", message: "Expense deleted" });
    } catch {
      showToast({ type: "error", message: "Delete failed" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Expenses</h3>
            <p className="text-sm text-slate-500">Month: {month}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          {/* SORT */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Sort</label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="rounded border px-2 py-1"
            >
              <option value="amount_desc">Amount — High to Low</option>
              <option value="amount_asc">Amount — Low to High</option>
              <option value="date_desc">Date — Newest First</option>
              <option value="date_asc">Date — Oldest First</option>
            </select>
          </div>

          {/* FILTER */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Filter</label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="rounded border px-2 py-1"
              >
                <option value="all">All (month)</option>
                <option value="single">Single day</option>
                <option value="range">Date range</option>
              </select>
            </div>

            {/* Single date */}
            {filterMode === "single" && (
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="rounded border px-2 py-1"
              />
            )}

            {/* Range */}
            {filterMode === "range" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="rounded border px-2 py-1"
                />
                <span className="text-slate-600">to</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="rounded border px-2 py-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Expense list */}
        <div className="mt-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="text-center text-slate-500 py-8">Loading…</div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No expenses found for this filter.
            </div>
          )}

          {!loading &&
            sorted.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between p-3 border-b"
              >
                <div>
                  <div className="text-sm text-slate-500">{e.notes || "—"}</div>
                  <div className="text-xs text-slate-400">
                    {format(new Date(e.date), "PPpp")}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium">
                    ${e.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
