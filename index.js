require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY.trim();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const Expense = mongoose.model('Expense', {
    item: String,
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now }
});

// Strict English AI Parser
async function getAIAnalysis(text) {
    const payload = {
        contents: [{
            parts: [{
                text: `Analyze this text: "${text}". 
                Convert it into a JSON array of objects.
                Rules:
                1. "item": Product name in English.
                2. "amount": Extract the number exactly as it appears. DO NOT convert currency values.
                3. "category": Food, Leisure, Transport, or General.
                Return ONLY raw JSON array.`
            }]
        }]
    };

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI Error");
    return data.candidates[0].content.parts[0].text;
}

app.post('/add-ai-expense', async (req, res) => {
    const { text } = req.body;
    try {
        const aiResponse = await getAIAnalysis(text);
        const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResults = JSON.parse(cleaned);
        const resultsArray = Array.isArray(aiResults) ? aiResults : [aiResults];

        // Validation to prevent empty rows
        const validData = resultsArray.filter(exp => exp.item && exp.amount > 0);
        
        const saved = await Expense.insertMany(validData);
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: "Failed to parse expense" });
    }
});

app.get('/expenses', async (req, res) => {
    const data = await Expense.find().sort({ date: -1 });
    res.json(data);
});

app.delete('/expense/:id', async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));