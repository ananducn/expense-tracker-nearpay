// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ReportsTable from "../components/ReportsTable";
import { useBudgetStore } from "../stores/budgetStore";
import { useExpenseStore } from "../stores/expenseStore";
import { getMonthString } from "../utils/getMonthString";
import { useUiStore } from "../stores/uiStore";

export default function Reports() {
  const { budgets, fetchBudgets, loading: budgetsLoading } = useBudgetStore();
  const { fetchExpenses, expenses } = useExpenseStore();
  const openExpenseModal = useUiStore((s) => s.openExpenseModal);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  useEffect(() => {
    // fetch budgets and expenses for this month
    fetchBudgets(currentMonth).catch(() => {});
    if (typeof fetchExpenses === "function") {
      fetchExpenses(currentMonth).catch(() => {});
    }
  }, [currentMonth]);

  // derived totals
  const totalBudget = budgets.reduce((s, b) => s + Number(b.limit ?? 0), 0);
  const totalSpent = budgets.reduce(
    (s, b) => s + Number(b.totalSpent ?? b.spent ?? 0),
    0
  );
  const remaining = +(totalBudget - totalSpent).toFixed(2);
  const percentOfBudget =
    totalBudget === 0 ? 0 : Math.round((totalSpent / totalBudget) * 100);

  const nextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const newM = m === 12 ? 1 : m + 1;
    const newY = m === 12 ? y + 1 : y;
    setCurrentMonth(`${newY}-${String(newM).padStart(2, "0")}`);
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const newM = m === 1 ? 12 : m - 1;
    const newY = m === 1 ? y - 1 : y;
    setCurrentMonth(`${newY}-${String(newM).padStart(2, "0")}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* month header */}
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

            {/* top stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="Total Spent"
                value={`${
                  totalSpent.toFixed(2) ? `$${totalSpent.toFixed(2)}` : "$0.00"
                }`}
                subtitle={`${percentOfBudget}% of budget`}
                accent="text-slate-900"
              />
              <StatCard
                title="Total Budget"
                value={`$${totalBudget.toFixed(2)}`}
                subtitle="Monthly allocation"
                accent="text-slate-900"
              />
              <StatCard
                title="Remaining"
                value={`$${Math.abs(remaining).toFixed(2)}`}
                subtitle={remaining < 0 ? "Over budget" : "Under budget"}
                accent={remaining < 0 ? "text-red-600" : "text-green-600"}
              />
            </div>

            {/* category breakdown table */}
            <ReportsTable rows={budgets} />
          </div>
        </main>
      </div>
    </div>
  );
}
