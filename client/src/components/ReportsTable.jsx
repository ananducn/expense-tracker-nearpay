// src/components/ReportsTable.jsx
import React from "react";

/**
 * ReportsTable
 * props:
 *  - rows: array of budgets with category populated and totalSpent field
 *  - currency (optional, default '$')
 */
function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: "linear-gradient(90deg,#0ea5e9,#2563eb)"
        }}
      />
    </div>
  );
}

export default function ReportsTable({ rows = [], currency = "$" }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>

      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="py-3 pl-4">Category</th>
              <th className="py-3 text-right pr-6">Spent</th>
              <th className="py-3 text-right pr-6">Budget</th>
              <th className="py-3 text-right pr-6">Remaining</th>
              <th className="py-3 pr-6">Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const title = r.category?.name ?? "Unnamed";
              const colorDot = r.category?.color ?? "#0ea5e9";
              const spent = Number(r.totalSpent ?? r.spent ?? 0);
              const limit = Number(r.limit ?? 0);
              const remaining = +(limit - spent).toFixed(2);
              const percent = limit === 0 ? 0 : Math.round((spent / limit) * 100);

              return (
                <tr key={r._id} className="border-b last:border-b-0">
                  <td className="py-4 pl-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ background: colorDot }}
                      />
                      <div className="text-slate-700 font-medium">{title}</div>
                    </div>
                  </td>

                  <td className="py-4 pr-6 text-right align-middle">
                    <div className="text-slate-700 font-medium">{currency}{spent.toFixed(2)}</div>
                  </td>

                  <td className="py-4 pr-6 text-right align-middle">
                    <div className="text-slate-500">{currency}{limit.toFixed(2)}</div>
                  </td>

                  <td className="py-4 pr-6 text-right align-middle">
                    <div className={`font-medium ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                      {remaining < 0 ? `-${currency}${Math.abs(remaining).toFixed(2)}` : `${currency}${remaining.toFixed(2)}`}
                    </div>
                  </td>

                  <td className="py-4 pr-6 align-middle w-56">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar percent={percent} />
                      </div>
                      <div className="text-sm text-slate-500 w-12 text-right">{percent}%</div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  No categories / budgets for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
