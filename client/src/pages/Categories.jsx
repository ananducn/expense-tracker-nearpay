// src/pages/Categories.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CategoryCard from "../components/CategoryCard";
import AddEditCategoryModal from "../components/AddEditCategoryModal";
import { useCategoryStore } from "../stores/categoryStore";
import { useUiStore } from "../stores/uiStore";

export default function Categories() {
  const { categories, fetchCategories } = useCategoryStore();
  const openModal = useUiStore((s) => s.openExpenseModal); // we can reuse async modal flag, or you can add a dedicated one
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories().catch(() => {});
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Categories</h1>
                <p className="text-sm text-slate-500">Manage your spending categories</p>
              </div>
              <div>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow"
                >
                  + Add Category
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(categories || []).map((c) => (
                <CategoryCard
                  key={c._id}
                  category={c}
                  onEdit={() => handleEdit(c)}
                />
              ))}
            </div>

            {(!categories || categories.length === 0) && (
              <div className="text-center py-16 text-slate-400">No categories yet. Add your first category.</div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <AddEditCategoryModal
          initial={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
            // refresh categories
            fetchCategories().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
