// src/components/CategoryCard.jsx
import React, { useState } from "react";
import { useCategoryStore } from "../stores/categoryStore";

export default function CategoryCard({ category, onEdit }) {
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCategory(category._id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: category.color ?? "#0ea5e9" }}
          />
          <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
        </div>
        <div className="text-sm text-slate-400 mt-3">Color: {category.color ?? "—"}</div>
      </div>

      <div className="flex items-start gap-3">
        <button
          onClick={onEdit}
          className="p-2 rounded-md hover:bg-slate-100"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 010 2.828L8.414 14.414l-4 1 1-4L14.586 2.586a2 2 0 012.828 0z" />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          className="p-2 rounded-md hover:bg-slate-100"
          title="Delete"
          disabled={deleting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
