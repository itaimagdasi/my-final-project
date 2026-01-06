require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. הגדרות ה-AI - שימוש בנתיב הישיר והיציב
// וודא שבקובץ ה-.env המפתח שלך (itai) מעודכן
const GEMINI_API_KEY = process.env.GEMINI_API_KEY.trim();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// 2. חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ מחובר בהצלחה ל-MongoDB!"))
    .catch(err => console.error("❌ שגיאת מונגו:", err));

const Expense = mongoose.model('Expense', {
    item: String,
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now }
});

// 3. פונקציית ה-Fetch עם הנחיה (Prompt) נוקשה יותר למניעת שגיאות
async function getAIAnalysis(text) {
    const payload = {
        contents: [{
            parts: [{
                text: `You are a financial data extractor. 
                Task: Convert the user text into a JSON array of objects.
                User text: "${text}"
                Rules:
                1. Each object MUST have: "item" (string), "amount" (number), "category" (Food, Leisure, Transport, or General).
                2. Translate "item" to Hebrew.
                3. Return ONLY the raw JSON array. No markdown, no backticks, no extra text.
                Example: [{"item": "לחם", "amount": 10, "category": "Food"}]`
            }]
        }]
    };

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI Request failed");

    return data.candidates[0].content.parts[0].text;
}

// 4. נתיב ההוספה החכמה עם "מנגנון הגנה"
app.post('/add-ai-expense', async (req, res) => {
    const { text } = req.body;
    console.log("📝 מנתח בקשה חדשה:", text);

    try {
        const aiResponse = await getAIAnalysis(text);
        
        // ניקוי תשובת ה-AI
        const cleanedText = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResults = JSON.parse(cleanedText);
        const resultsArray = Array.isArray(aiResults) ? aiResults : [aiResults];

        // --- מנגנון הגנה: מסננים רק נתונים תקינים (מונע שורות ריקות בטבלה) ---
        const validExpenses = resultsArray.filter(exp => 
            exp.item && 
            exp.item !== "---" && 
            typeof exp.amount === 'number' && 
            exp.amount > 0
        );

        if (validExpenses.length === 0) {
            console.log("⚠️ ה-AI החזיר נתונים לא תקינים, השמירה בוטלה.");
            return res.status(400).json({ error: "לא ניתן היה להבין את ההוצאה" });
        }

        const saved = await Expense.insertMany(validExpenses);
        console.log("✅ נשמר בהצלחה:", saved);
        res.json(saved);
    } catch (err) {
        console.error("❌ שגיאה בתהליך:", err.message);
        res.status(500).json({ error: "שגיאת שרת", details: err.message });
    }
});

// 5. נתיבים נוספים
app.get('/expenses', async (req, res) => {
    const data = await Expense.find().sort({ date: -1 });
    res.json(data);
});

app.delete('/expense/:id', async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 השרת רץ בפורט ${PORT}`));