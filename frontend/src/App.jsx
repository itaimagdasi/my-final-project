import { useState, useEffect } from 'react'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. משיכת נתונים מהשרת
  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:3000/expenses');
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("שגיאה במשיכת נתונים:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 2. הוספת הוצאה חכמה (Mock AI)
  const addAiExpense = async () => {
    if (!aiText.trim()) return;
    
    try {
      await fetch('http://localhost:3000/add-ai-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText })
      });
      setAiText('');
      fetchExpenses(); // רענון הרשימה
    } catch (err) {
      alert("שגיאה בשליחת הנתונים");
    }
  };

  // 3. מחיקת הוצאה
  const deleteExpense = async (id) => {
    try {
      await fetch(`http://localhost:3000/expense/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  // חישוב סה"כ הוצאות
  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>SmartExpense AI 💰</h1>
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>סה"כ הוצאות:</span>
          <span style={styles.totalAmount}>{total.toLocaleString()} ₪</span>
        </div>
      </header>

      <div style={styles.aiSection}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>✨ הוספה מהירה</h3>
        <div style={styles.inputGroup}>
          <input 
            style={styles.input} 
            placeholder="למשל: 'סושי ב-120 שקל'..." 
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAiExpense()}
          />
          <button onClick={addAiExpense} style={styles.button}>הוסף</button>
        </div>
      </div>

      <div style={styles.listSection}>
        <h3 style={styles.sectionTitle}>היסטוריית הוצאות</h3>
        {loading ? (
          <p style={{ textAlign: 'center' }}>טוען נתונים...</p>
        ) : (
          <div style={styles.list}>
            {expenses.length === 0 ? (
              <p style={styles.emptyMsg}>אין עדיין הוצאות. נסה להוסיף משהו למעלה!</p>
            ) : (
              expenses.map(exp => (
                <div key={exp._id} style={styles.card}>
                  <div style={styles.cardRight}>
                    <div style={styles.itemTitle}>{exp.item}</div>
                    <div style={styles.itemMeta}>
                      <span style={styles.tag}>{exp.category}</span>
                      <span style={styles.dot}>•</span>
                      <span>{new Date(exp.date).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>
                  <div style={styles.cardLeft}>
                    <span style={styles.itemAmount}>{exp.amount} ₪</span>
                    <button onClick={() => deleteExpense(exp._id)} style={styles.deleteBtn}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// עיצוב (CSS-in-JS)
const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl', color: '#2c3e50' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', marginBottom: '20px' },
  totalCard: { background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(46, 204, 113, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: '18px', opacity: 0.9 },
  totalAmount: { fontSize: '28px', fontWeight: 'bold' },
  aiSection: { background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e9ecef' },
  inputGroup: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  listSection: { marginTop: '20px' },
  sectionTitle: { borderBottom: '2px solid #f1f1f1', paddingBottom: '10px', marginBottom: '20px' },
  card: { background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', border: '1px solid #f8f9fa' },
  cardRight: { display: 'flex', flexDirection: 'column', gap: '5px' },
  itemTitle: { fontSize: '18px', fontWeight: '600' },
  itemMeta: { fontSize: '13px', color: '#95a5a6', display: 'flex', alignItems: 'center', gap: '8px' },
  tag: { background: '#ecf0f1', padding: '2px 8px', borderRadius: '4px', color: '#7f8c8d' },
  itemAmount: { fontSize: '18px', fontWeight: 'bold', marginLeft: '15px' },
  cardLeft: { display: 'flex', alignItems: 'center' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6 },
  emptyMsg: { textAlign: 'center', color: '#bdc3c7', marginTop: '40px' }
};

export default App;