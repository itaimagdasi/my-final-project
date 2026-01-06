require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        // נסיון עם המודל הכי בסיסי
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("--- מנסה לתקשר עם Gemini ---");
        const result = await model.generateContent("Say hello");
        console.log("תשובה מגוגל:", result.response.text());
        console.log("✅ ה-API Key תקין והמודל נמצא!");
    } catch (err) {
        console.error("❌ תקלה בחיבור:");
        console.error("הודעה:", err.message);
        if (err.message.includes("404")) {
            console.log("טיפ: גוגל טוענת שהמודל לא קיים. וודא שאתה לא משתמש ב-VPN.");
        }
    }
}

test();