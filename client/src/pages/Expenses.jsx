// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useExpenseStore } from "../stores/expenseStore";
import EditExpenseModal from "../components/EditExpenseModal";
import { format } from "date-fns";
import { useUiStore } from "../stores/uiStore";

function ExpenseRow({ e, onDelete, onEdit }) {
  const catName = e.category?.name ?? "Uncategorized";
  const catColor = e.category?.color ?? "#CBD5E1"; // fallback light slate

  return (
    <div className="flex items-center justify-between gap-4 p-3 border-b">
      <div className="flex items-start gap-3 min-w-0">
        {/* category dot + name */}
        <div className="flex-shrink-0 mt-0.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: catColor }}
            aria-hidden
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-slate-700 truncate">
              {catName}
            </div>
            <div className="text-xs text-slate-400">•</div>
            <div className="text-sm text-slate-500 truncate">
              {e.notes || "—"}
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {format(new Date(e.date), "PPpp")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-lg font-medium">
          ${Number(e.amount).toFixed(2)}
        </div>

        <button
          onClick={() => onEdit && onEdit(e)}
          className="text-slate-600 text-sm px-2 py-1 rounded hover:bg-slate-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(e._id)}
          className="text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Expenses() {
  const showToast = useUiStore((s) => s.showToast);

  const [mode, setMode] = useState("month"); // 'month' | 'range'
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const todayYMD = new Date().toISOString().slice(0, 10);
  const [rangeStart, setRangeStart] = useState(todayYMD);
  const [rangeEnd, setRangeEnd] = useState(todayYMD);

  // client controls
  const [sortMode, setSortMode] = useState("date_desc");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [visibleCount, setVisibleCount] = useState(25);

  // Use store
  const expenses = useExpenseStore((s) => s.expenses);
  const loading = useExpenseStore((s) => s.loading);
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const fetchExpensesRange = useExpenseStore((s) => s.fetchExpensesRange);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);

  // editing modal state
  const [editingExpense, setEditingExpense] = useState(null);

  // fetch default month on mount
  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    fetchExpenses &&
      fetchExpenses(currentMonth).catch((err) => {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Failed to load expenses",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // month navigation helpers
  const nextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const newM = m === 12 ? 1 : m + 1;
    const newY = m === 12 ? y + 1 : y;
    const nm = `${newY}-${String(newM).padStart(2, "0")}`;
    setCurrentMonth(nm);
    if (mode === "month" && fetchExpenses) {
      fetchExpenses(nm).catch(() => {
        showToast({ type: "error", message: "Failed to load month" });
      });
    }
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const newM = m === 1 ? 12 : m - 1;
    const newY = m === 1 ? y - 1 : y;
    const nm = `${newY}-${String(newM).padStart(2, "0")}`;
    setCurrentMonth(nm);
    if (mode === "month" && fetchExpenses) {
      fetchExpenses(nm).catch(() => {
        showToast({ type: "error", message: "Failed to load month" });
      });
    }
  };

  const applyRange = () => {
    const s = new Date(rangeStart);
    const e = new Date(rangeEnd);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return showToast({ type: "error", message: "Invalid date(s)" });
    }
    if (s > e)
      return showToast({ type: "error", message: "Start must be <= End" });

    setMode("range");
    if (fetchExpensesRange) {
      fetchExpensesRange(rangeStart, rangeEnd).catch(() => {
        showToast({ type: "error", message: "Failed to load range" });
      });
    } else {
      showToast({ type: "error", message: "Range fetch not available" });
    }
  };

  const switchToMonth = (m) => {
    setMode("month");
    setCurrentMonth(m);
    if (fetchExpenses) {
      fetchExpenses(m).catch(() => {
        showToast({ type: "error", message: "Failed to load month" });
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      showToast({ type: "success", message: "Expense deleted" });
      // store already removed it optimistically; to be safe, refetch
      if (mode === "month" && fetchExpenses)
        fetchExpenses(currentMonth).catch(() => {});
      else if (mode === "range" && fetchExpensesRange)
        fetchExpensesRange(rangeStart, rangeEnd).catch(() => {});
    } catch (err) {
      console.error("delete expense failed:", err);
      showToast({ type: "error", message: "Delete failed" });
    }
  };

  // client-side filter and sort
  const filteredAndSorted = useMemo(() => {
    let arr = (expenses || []).slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter((x) => (x.notes || "").toLowerCase().includes(q));
    }

    switch (sortMode) {
      case "amount_asc":
        arr.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      case "amount_desc":
        arr.sort((a, b) => Number(b.amount) - Number(a.amount));
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
  }, [expenses, query, sortMode]);

  const visible = filteredAndSorted.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* header + controls */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Expenses
                </h1>
                <div className="text-sm text-slate-500">
                  View and filter expenses
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
                  <button onClick={prevMonth} className="px-2">
                    ‹
                  </button>
                  <input
                    type="month"
                    value={currentMonth}
                    onChange={(e) => switchToMonth(e.target.value)}
                    className="outline-none"
                  />
                  <button onClick={nextMonth} className="px-2">
                    ›
                  </button>
                </div>

                <div className="bg-white p-2 rounded shadow-sm flex items-center gap-2">
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="rounded border px-2 py-1"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="rounded border px-2 py-1"
                  />
                  <button
                    onClick={applyRange}
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* top controls: search + sort */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Search notes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="rounded border px-3 py-2 w-64"
                />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  className="rounded border px-2 py-2"
                >
                  <option value="date_desc">Date — Newest</option>
                  <option value="date_asc">Date — Oldest</option>
                  <option value="amount_desc">Amount — High → Low</option>
                  <option value="amount_asc">Amount — Low → High</option>
                </select>
              </div>

              <div className="text-sm text-slate-500">
                Showing {visible.length} of {filteredAndSorted.length} expenses
              </div>
            </div>

            {/* list */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {loading && (
                <div className="text-center py-8 text-slate-500">Loading…</div>
              )}

              {!loading && visible.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No expenses found.
                </div>
              )}

              {!loading &&
                visible.map((e) => (
                  <ExpenseRow
                    key={e._id}
                    e={e}
                    onDelete={handleDelete}
                    onEdit={(exp) => setEditingExpense(exp)}
                  />
                ))}

              {!loading && visibleCount < filteredAndSorted.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setVisibleCount((v) => v + pageSize)}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => {
            setEditingExpense(null);
            // refresh current view after edit
            if (mode === "month" && fetchExpenses)
              fetchExpenses(currentMonth).catch(() => {});
            else if (mode === "range" && fetchExpensesRange)
              fetchExpensesRange(rangeStart, rangeEnd).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
