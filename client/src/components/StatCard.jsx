// src/components/StatCard.jsx
import React from "react";

/**
 * StatCard
 * props:
 *  - title (string)
 *  - value (string or number)
 *  - subtitle (string)
 *  - accent (optional tailwind text color class)
 */
export default function StatCard({ title, value, subtitle, accent = "text-slate-700" }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className={`text-2xl font-bold ${accent} mt-2`}>{value}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
        </div>
        <div className="text-slate-300 text-xl select-none">↗</div>
      </div>
    </div>
  );
}
