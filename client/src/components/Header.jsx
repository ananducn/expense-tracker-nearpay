import React from "react";
import { useAuthStore } from "../stores/authStore";

export default function Header() {
const logout = useAuthStore((s) => s.logout);


  return (
    <header className="flex items-center justify-between px-6 py-4  bg-white">
      <div></div>
      <div className="flex items-center gap-4">
        <button
          className="text-sm text-slate-600 hover:text-slate-900"
          onClick={logout}
        >
          {" "}
          <span className="hidden sm:inline bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
            Logout
          </span>{" "}
        </button>
      </div>
    </header>
  );
}
