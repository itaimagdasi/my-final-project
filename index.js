require('dotenv').config(); // טעינת משתני סביבה מהקובץ .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- חיבור ל-MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to Secure MongoDB!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- הגדרת המודל (Schema) ---
const Expense = mongoose.model('Expense', {
    item: String,
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now }
});

// --- נתיבים (Routes) ---

// 1. קבלת כל ההוצאות (ממוין מהחדש ביותר לישן ביותר)
app.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. הוספה חכמה (Mock AI - מדמה ניתוח טקסט)
app.post('/add-ai-expense', async (req, res) => {
    const { text } = req.body;
    console.log("Processing text:", text);

    if (!text) return res.status(400).send("No text provided");

    // לוגיקה פשוטה לזיהוי מספר וקטגוריה
    const amountMatch = text.match(/\d+/); 
    const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
    
    let category = "כללי";
    if (text.includes("אוכל") || text.includes("פיצה") || text.includes("סושי")) category = "מזון";
    if (text.includes("מקלדת") || text.includes("משחק") || text.includes("גיימינג")) category = "פנאי";
    if (text.includes("אוטובוס") || text.includes("מונית") || text.includes("דלק")) category = "תחבורה";

    const extractedData = {
        item: text.replace(/[0-9]/g, '').replace('שקל', '').replace('ב-', '').trim() || "הוצאה חדשה",
        amount: amount,
        category: category
    };

    try {
        const newExpense = new Expense(extractedData);
        await newExpense.save();
        res.json(newExpense);
    } catch (err) {
        res.status(500).json({ error: "Failed to save AI expense" });
    }
});

// 3. הוספה ידנית (הטופס הרגיל)
app.post('/add-expense', async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        await newExpense.save();
        res.json(newExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. מחיקת הוצאה לפי ID
app.delete('/expense/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

// --- הפעלת השרת ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});