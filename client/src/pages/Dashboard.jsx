// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BudgetCard from "../components/BudgetCard";
import ExpenseListModal from "../components/ExpenseListModal"; // NEW
import { useBudgetStore } from "../stores/budgetStore";
import { getMonthString } from "../utils/getMonthString";
import AddExpenseModal from "../components/AddExpenseModal";
import { useUiStore } from "../stores/uiStore";

export default function Dashboard() {
  const { budgets, fetchBudgets, loading } = useBudgetStore();
  const openExpenseModal = useUiStore((s) => s.openExpenseModal);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  // NEW — state for clicked category
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isExpenseListOpen, setIsExpenseListOpen] = useState(false);

  // fetch budgets on load + when month changes
  useEffect(() => {
    fetchBudgets(currentMonth).catch(() => {});
  }, [currentMonth]);

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

  // ——————— OPEN MODAL WHEN CARD CLICKED ———————
  const openCategoryExpenses = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsExpenseListOpen(true);
  };

  const closeCategoryExpenses = () => {
    setSelectedCategoryId(null);
    setIsExpenseListOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <div className="max-w-full mx-auto space-y-6">
            {/* month header */}
            <div className="bg-white rounded-lg p-6 shadow-sm border flex items-center justify-between">
              <button
                className="px-3 py-2 rounded-md text-3xl cursor-pointer"
                onClick={prevMonth}
              >
                ‹
              </button>

              <h2 className="font-semibold text-lg">
                {getMonthString(currentMonth)}
              </h2>

              <button
                className="px-3 py-2 rounded-md text-3xl cursor-pointer"
                onClick={nextMonth}
              >
                ›
              </button>
            </div>

            {/* loading */}
            {loading && (
              <div className="text-center text-slate-500">Loading budgets…</div>
            )}

            {/* empty */}
            {!loading && budgets.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                No budgets found for this month. Add one!
              </div>
            )}

            {/* grid */}
            {!loading && budgets.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((b) => (
                  <BudgetCard
                    key={b._id}
                    title={b.category?.name || "Unnamed Category"}
                    color={b.category?.color ? b.category.color : "bg-blue-500"}
                    spent={b.totalSpent || 0}
                    budget={b.limit}
                    onClick={() => openCategoryExpenses(b.category?._id)} // NEW
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <AddExpenseModal />
      </div>

      {/* floating quick add */}
      <div className="pt-4">
        <div className="flex justify-end">
          <button
            onClick={openExpenseModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow fixed bottom-12 right-6 cursor-pointer"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* ——————— EXPENSE LIST MODAL ——————— */}
      <ExpenseListModal
        isOpen={isExpenseListOpen}
        onClose={closeCategoryExpenses}
        categoryId={selectedCategoryId}
        month={currentMonth}
      />
    </div>
  );
}
