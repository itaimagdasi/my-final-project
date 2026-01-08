import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './App.css';

const getCategoryClass = (cat) => {
  if (!cat) return 'general';
  const c = cat.toLowerCase();
  return ['food', 'leisure', 'transport'].includes(c) ? c : 'general';
};

const ExpenseChart = ({ expenses }) => {
  const prepareData = () => {
    const summary = expenses.reduce((acc, exp) => {
      if (!exp.amount || isNaN(exp.amount)) return acc;
      const cat = exp.category || 'General';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});
    return Object.keys(summary).map(key => ({ name: key, value: summary[key] }));
  };
  const data = prepareData();
  const COLORS = ['#6366f1', '#22c55e', '#eab308', '#f87171', '#94a3b8'];
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" label>
            {data.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    const res = await fetch('http://localhost:3000/expenses');
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleAdd = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    await fetch('http://localhost:3000/add-ai-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });
    setInputText(""); fetchExpenses(); setLoading(false);
  };

  const deleteExp = async (id) => {
    await fetch(`http://localhost:3000/expense/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  // --- New Logic: Clear All ---
  const clearAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL expenses? This cannot be undone.")) {
      await fetch('http://localhost:3000/expenses/clear-all', { method: 'DELETE' });
      fetchExpenses();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Smart Expense Tracker 💰</h1>
        <p>AI-Powered Financial Analytics Dashboard</p>
      </header>

      <div className="input-card">
        <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Enter expense (e.g., Pizza for 15 dollars)" />
        <button className="btn-ai" onClick={handleAdd} disabled={loading}>{loading ? 'Processing...' : 'Add Expense'}</button>
      </div>

      <div className="chart-card">
        <h3 className="section-title">Spending Distribution</h3>
        <ExpenseChart expenses={expenses} />
      </div>

      <div className="table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Recent Expenses</h3>
          <button onClick={clearAll} className="btn-clear">Clear All</button>
        </div>
        <table>
          <thead>
            <tr><th>Item</th><th>Amount</th><th>Category</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td>{exp.item}</td>
                <td className="amount-cell">{exp.amount} ₪</td>
                <td><span className={`badge badge-${getCategoryClass(exp.category)}`}>{exp.category}</span></td>
                <td><button className="btn-delete" onClick={() => deleteExp(exp._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default App;