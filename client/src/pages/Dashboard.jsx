import React, { useEffect, useState } from 'react';
import { useCategoryStore } from '../stores/categoryStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useUiStore } from '../stores/uiStore';
import ExpenseForm from '../components/ExpenseForm';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard(){
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchBudgets, budgets } = useBudgetStore();
  const { fetchExpenses, expenses } = useExpenseStore();
  const { isExpenseModalOpen, openExpenseModal, closeExpenseModal, toast } = useUiStore();
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const logout = useAuthStore(s=>s.logout);

  useEffect(()=>{ fetchCategories(); fetchBudgets(month); fetchExpenses(month); }, [month]);

  return (
    <div style={{padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 className='text-amber-300'>Expense Dashboard</h1>
        <div>
          <select value={month} onChange={e=>setMonth(e.target.value)}>
            {/* show current and previous 3 months */}
            {Array.from({length:4}).map((_,i)=>{
              const d = new Date();
              d.setMonth(d.getMonth()-i);
              const val = d.toISOString().slice(0,7);
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
          <button  onClick={openExpenseModal} style={{marginLeft:10}}>Add Expense</button>
          <button onClick={()=>{logout();window.location.reload();}} style={{marginLeft:10}}>Logout</button>
        </div>
      </header>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginTop:20}}>
        {categories.map(cat => {
          const bud = budgets.find(b=>b.category && b.category._id === cat._id);
          const spent = expenses.filter(e=> e.category && e.category._id === cat._id).reduce((s,ex)=>s+Number(ex.amount||0),0);
          const limit = bud ? bud.limit : 0;
          const remaining = limit - spent;
          return (
            <div key={cat._id} style={{border:'1px solid #ddd',padding:12,borderRadius:8}}>
              <h3>{cat.name}</h3>
              <div>Spent: {spent}</div>
              <div>Limit: {limit}</div>
              <div style={{color: remaining<0?'red':'green'}}>Remaining: {remaining}</div>
            </div>
          )
        })}
      </section>

      {isExpenseModalOpen && (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}}>
          <div style={{background:'#fff',padding:20,width:420}}>
            <button  onClick={closeExpenseModal} style={{float:'right'}}>Close</button>
            <ExpenseForm onClose={closeExpenseModal}/>
          </div>
        </div>
      )}

      {toast && <div style={{position:'fixed',right:20,bottom:20,background:toast.type==='error'?'#f8d7da':'#d1e7dd',padding:12,borderRadius:6}}>{toast.message}</div>}
    </div>
  );
}
