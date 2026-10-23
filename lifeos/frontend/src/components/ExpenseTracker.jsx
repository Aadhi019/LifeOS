import React, { useState } from 'react';
import axios from 'axios';
import { Receipt, DollarSign, Plus, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function ExpenseTracker({ financeInfo }) {
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState('transit');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Airport Express Tube', category: 'Transit', amount: 850, status: 'Within Norm' },
    { id: 2, name: 'Executive Lunch Cafe', category: 'Food', amount: 1400, status: 'Within Norm' }
  ]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Targets from finance agent
  const targets = {
    lodging: financeInfo?.lodging || 12000,
    transit: financeInfo?.transit || 2500,
    food: financeInfo?.food || 4000,
    activities: financeInfo?.activities || 3000
  };

  const currentSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudget = financeInfo?.total || 21500;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseName || !amount) return;

    setIsAuditing(true);
    try {
      const res = await axios.post(`${API_BASE}/receipt-audit`, {
        expense_name: expenseName,
        category: category,
        amount: parseFloat(amount),
        currency: 'INR'
      });

      const auditStatus = res.data?.item?.audit_status || 'Audited';
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          name: expenseName,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount: parseFloat(amount),
          status: auditStatus
        }
      ]);

      setExpenseName('');
      setAmount('');
    } catch (err) {
      console.warn('Audit fallback:', err);
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          name: expenseName,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount: parseFloat(amount),
          status: 'Recorded'
        }
      ]);
      setExpenseName('');
      setAmount('');
    } finally {
      setIsAuditing(false);
    }
  };

  const percentage = Math.min(Math.round((currentSpent / totalBudget) * 100), 100);

  return (
    <div className="card-vintage p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-300/40 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-retro-mono font-bold uppercase tracking-wider text-amber-500 block">
              REAL-TIME EXPENDITURE SENTINEL
            </span>
            <h4 className="font-title font-bold text-lg text-neutral-800 dark:text-neutral-100">
              Receipt Audit &amp; Live Trip Ledger
            </h4>
          </div>
        </div>

        {/* Budget utilization badge */}
        <div className="text-right font-retro-mono">
          <span className="text-[9px] uppercase text-neutral-400 block">SPENT / TARGET</span>
          <span className="font-bold text-xs text-neutral-700 dark:text-neutral-200">
            INR {currentSpent.toLocaleString()} / {totalBudget.toLocaleString()} ({percentage}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden panel-neu-inset">
        <div 
          className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Add Expense Quick Form */}
      <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-retro-mono">
        <input
          type="text"
          placeholder="e.g. Airport Taxi, Dinner..."
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          className="p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none col-span-1 sm:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none text-neutral-700 dark:text-neutral-200"
        >
          <option value="transit">Transit</option>
          <option value="food">Food &amp; Dining</option>
          <option value="lodging">Lodging</option>
          <option value="activities">Activities</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="INR Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAuditing || !expenseName || !amount}
            className="btn-vintage btn-vintage-primary px-3 rounded-xl shrink-0 cursor-pointer font-bold"
          >
            {isAuditing ? "..." : "+"}
          </button>
        </div>
      </form>

      {/* Logged Item Chips */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs font-retro-mono">
        {expenses.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-neutral-900 border border-neutral-300/30 dark:border-neutral-800">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{exp.name}</span>
              <span className="text-[10px] text-neutral-400">({exp.category})</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">INR {exp.amount.toLocaleString()}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase ${exp.status.includes('High') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                {exp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
