import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// --- 1. רכיב הגרף עם לוגיקה לניקוי נתונים ---
const ExpenseChart = ({ expenses }) => {
  const prepareData = () => {
    // מפה לאיחוד קטגוריות (נורמליזציה)
    const categoryMap = {
      'Food': 'אוכל',
      'מזון': 'אוכל',
      'General': 'כללי',
      'Leisure': 'פנאי',
      'Transport': 'תחבורה'
    };

    const summary = expenses.reduce((acc, exp) => {
      // סינון נתונים פגומים (כדי למנוע NaN בגרף)
      if (!exp.amount || isNaN(exp.amount)) return acc;

      // איחוד שמות קטגוריות
      let cat = exp.category || 'כללי';
      if (categoryMap[cat]) cat = categoryMap[cat];

      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    return Object.keys(summary).map(key => ({
      name: key,
      value: summary[key]
    }));
  };

  const data = prepareData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (expenses.length === 0) return <p>אין עדיין נתונים להצגה בגרף</p>;

  return (
    <div style={{ width: '100%', height: 350, marginBottom: '40px', textAlign: 'center' }}>
      <h3>📊 התפלגות הוצאות חכמה</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- 2. הרכיב הראשי של האפליקציה ---
function App() {
  const [expenses, setExpenses] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // משיכת נתונים מהשרת
  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:3000/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // שליחה ל-AI
  const handleAIAdd = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/add-ai-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      if (res.ok) {
        setInputText("");
        fetchExpenses();
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // מחיקה
  const deleteExpense = async (id) => {
    try {
      await fetch(`http://localhost:3000/expense/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', direction: 'rtl', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>💰 ניהול הוצאות חכם</h1>

      {/* אזור הזנה */}
      <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="מה קנית היום? (למשל: סושי ב-120 שקלים)"
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' }}
          />
          <button 
            onClick={handleAIAdd} 
            disabled={loading}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: loading ? '#ccc' : '#4CAF50', 
              color: 'white', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'מנתח...' : 'הוספה חכמה'}
          </button>
        </div>
      </div>

      {/* הגרף */}
      <ExpenseChart expenses={expenses} />

      {/* טבלת הנתונים */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>רשימת הוצאות אחרונות</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>פריט</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>סכום</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>קטגוריה</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{exp.item || '---'}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{exp.amount ? `${exp.amount} ₪` : '---'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>
                    {exp.category || 'כללי'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => deleteExpense(exp._id)} 
                    style={{ color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;