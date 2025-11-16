// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Responsive Sidebar:
 *  - md and up -> left sidebar
 *  - below md  -> bottom nav only + small top right title
 */

const SIDEBAR_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
  { to: "/expenses", label: "Expenses" },
  { to: "/categories", label: "Categories" },
  { to: "/budgets", label: "Budgets" },
];

function NavItem({ to, label, compact = false }) {
  const justifyClass = compact ? "justify-center" : "justify-start";
  const textSizeClass = compact ? "text-xs" : "text-sm";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center ${justifyClass} w-full px-3 py-2 rounded-md transition ${
          isActive
            ? "bg-blue-700 text-white"
            : "text-slate-600 hover:bg-slate-100"
        } ${textSizeClass}`
      }
      end
    >
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* MOBILE TOP RIGHT TITLE */}
      <div className="md:hidden flex items-center justify-end bg-white px-4 py-3 border-b">
        <div className="text-base font-semibold text-slate-700">
          Budget Tracker
        </div>
      </div>

      {/* LEFT SIDEBAR for md+ */}
      <aside
        className="bg-white h-screen px-4 py-6 border-r md:block hidden fixed md:relative z-40 top-0 left-0 w-64"
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="font-semibold">BT</span>
          </div>
          <div>
            <div className="text-lg font-semibold">Budget Tracker</div>
            <div className="text-xs text-slate-400">Manage your expenses</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {SIDEBAR_ITEMS.map((it) => (
            <NavItem key={it.to} to={it.to} label={it.label} />
          ))}
        </nav>
      </aside>

      {/* BOTTOM NAV - Mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden flex justify-around items-center py-2 z-40"
        aria-label="Bottom navigation"
      >
        {SIDEBAR_ITEMS.map((it) => (
          <div key={it.to} className="flex-1 px-1">
            <NavItem to={it.to} label={it.label} compact />
          </div>
        ))}
      </nav>
    </>
  );
}
