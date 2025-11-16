// src/pages/Budgets.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCategoryStore } from "../stores/categoryStore";
import { useBudgetStore } from "../stores/budgetStore";
import { useUiStore } from "../stores/uiStore";
import { getMonthString } from "../utils/getMonthString";

function BudgetRow({ category, value, onChange }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: category.color ?? "#0ea5e9" }}
        />
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {category.name}
          </div>
          <div className="text-sm text-slate-400">
            Color: {category.color ?? "—"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-slate-600">$</div>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(category._id, e.target.value)}
          className="w-28 rounded-lg border border-slate-200 px-4 py-2 text-right focus:outline-none"
        />
      </div>
    </div>
  );
}

export default function Budgets() {
  const { categories, fetchCategories } = useCategoryStore();
  const { budgets, fetchBudgets, upsertBudget, loading } = useBudgetStore();
  const showToast = useUiStore((s) => s.showToast);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  // local map of categoryId -> limit (string to keep input friendly)
  const [limits, setLimits] = useState({});
  const [saving, setSaving] = useState(false);

  // fetch categories + budgets when month changes
  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchBudgets(currentMonth).catch(() => {});
  }, [currentMonth]);

  // initialize limits from budgets + categories
  useEffect(() => {
    const map = {};

    (categories || []).forEach((c) => {
      // find budget item for this category
      const b = (budgets || []).find(
        (x) => x.category && String(x.category._id) === String(c._id)
      );
      map[c._id] = b ? String(b.limit ?? 0) : "0";
    });
    setLimits(map);
  }, [categories, budgets]);

  const handleInputChange = (categoryId, val) => {
    if (val === "") {
      setLimits((s) => ({ ...s, [categoryId]: "" }));
      return;
    }

    const n = val;
    if (/^-/.test(n)) return; // ignore negative sign
    setLimits((s) => ({ ...s, [categoryId]: n }));
  };

  const nextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const prevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  // computed total of limits (treat empty as 0)
  const totalMonthlyBudget = useMemo(() => {
    return Object.values(limits || {}).reduce((s, v) => s + Number(v || 0), 0);
  }, [limits]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const tasks = [];
      for (const c of categories || []) {
        const valStr = limits[c._id];
        const valNum = Number(valStr || 0);
        // Only save when not NaN and >= 0
        if (Number.isNaN(valNum) || valNum < 0) continue;

        const existing = (budgets || []).find(
          (b) => b.category && String(b.category._id) === String(c._id)
        );

        if (!existing && valNum === 0) continue;

        tasks.push(
          upsertBudget({
            categoryId: c._id,
            month: currentMonth,
            limit: valNum,
          })
        );
      }

      for (const t of tasks) {
        try {
          await t;
        } catch (err) {
          console.error("upsert failed for one item:", err);
        }
      }

      // refresh budgets
      await fetchBudgets(currentMonth);
      showToast({ type: "success", message: "Budgets saved" });
    } catch (err) {
      console.error("save budgets failed:", err);
      showToast({ type: "error", message: "Failed to save budgets" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">
                  Monthly Budgets
                </h1>
                <p className="text-sm text-slate-500">
                  Set spending limits for each category
                </p>
              </div>

              <div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* month nav */}
            <div className="bg-white rounded-lg p-6 shadow-sm border flex items-center justify-between">
              <button
                className="px-3 py-2 rounded-md text-xl"
                onClick={prevMonth}
              >
                ‹
              </button>
              <h2 className="font-semibold text-lg">
                {getMonthString(currentMonth)}
              </h2>
              <button
                className="px-3 py-2 rounded-md text-xl"
                onClick={nextMonth}
              >
                ›
              </button>
            </div>

            {/* big total card */}
            <div className="bg-blue-700 text-white rounded-lg p-8 shadow-sm">
              <div className="text-xl font-semibold">Total Monthly Budget</div>
              <div className="text-4xl font-bold mt-4">
                ${totalMonthlyBudget.toFixed(2)}
              </div>
            </div>

            {/* loading or empty */}
            {loading && (
              <div className="text-center text-slate-500">Loading budgets…</div>
            )}

            {/* categories list */}
            <div className="grid grid-cols-1 gap-4">
              {(categories || []).map((c) => (
                <BudgetRow
                  key={c._id}
                  category={c}
                  value={limits[c._id] ?? "0"}
                  onChange={handleInputChange}
                />
              ))}

              {(!categories || categories.length === 0) && (
                <div className="text-center py-8 text-slate-400">
                  No categories found. Add categories first.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
