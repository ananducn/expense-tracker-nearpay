// src/components/BudgetCard.jsx
import React from "react";

export default function BudgetCard({
  title,
  color = "bg-blue-500",
  spent = 0,
  budget = 0,
  currency = "$",
  onClick, // new
}) {
  const percent =
    budget === 0 ? 0 : Math.min(100, Math.round((spent / budget) * 100));
  const remaining = budget - spent;
  const statusOver = remaining < 0;

  const rootClass =
    "bg-white rounded-lg shadow-sm p-5 border cursor-pointer hover:shadow-md transition";

  return (
    <div role="button" onClick={onClick} className={rootClass}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              background: color && color.startsWith("#") ? color : undefined,
            }}
            // if color is a tailwind class, also add className fallback
            // but we only apply inline style for hex values
          />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {statusOver && (
          <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            OVER BUDGET
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-500">
          <div>Spent</div>
          <div className="font-medium">
            {currency}
            {spent}
          </div>
        </div>

        <div className="mt-2 bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg,#0ea5e9,#2563eb)",
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-slate-400 mt-2">
          <div>Budget</div>
          <div>
            {currency}
            {budget}
          </div>
        </div>

        <div
          className={`mt-3 text-sm font-medium ${
            statusOver ? "text-red-600" : "text-green-600"
          }`}
        >
          {statusOver
            ? `${currency}${Math.abs(remaining)} over budget`
            : `${currency}${remaining} remaining`}
        </div>
      </div>
    </div>
  );
}
