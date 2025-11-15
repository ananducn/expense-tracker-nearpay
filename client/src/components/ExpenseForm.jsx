import React, { useState, useEffect } from 'react';
import { useCategoryStore } from '../stores/categoryStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useUiStore } from '../stores/uiStore';
import { formatISO } from 'date-fns';

export default function ExpenseForm({ defaultCategoryId=null, onClose }) {
  const { categories, fetchCategories } = useCategoryStore();
  const { addExpense } = useExpenseStore();
  const { showToast } = useUiStore();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categories.length) fetchCategories().catch(() => {});
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId) {
      showToast({ type: 'error', message: 'Amount and category required' });
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        amount: Number(amount),
        category: categoryId,
        date,
        notes,
      });
      setSaving(false);
      onClose?.();
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label>Category</label>
        <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)}>
          <option value="">Select</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label>Amount</label>
        <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
      </div>

      <div>
        <label>Date</label>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
      </div>

      <div>
        <label>Notes</label>
        <input value={notes} onChange={(e)=>setNotes(e.target.value)} />
      </div>

      <div>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Expense'}</button>
      </div>
    </form>
  );
}
