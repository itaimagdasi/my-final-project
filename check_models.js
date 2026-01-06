require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        console.log("--- בודק רשימת מודלים זמינים מול גוגל ---");
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ מצאתי את המודלים הבאים:");
            data.models.forEach(m => {
                console.log("- " + m.name.replace('models/', ''));
            });
            console.log("\nטיפ: אם gemini-1.5-flash מופיע ברשימה, הבעיה היא רק בגרסת ה-API.");
        } else {
            console.log("❌ גוגל לא החזירה מודלים. תשובה גולמית:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ שגיאת רשת:", err.message);
    }
}

listModels();