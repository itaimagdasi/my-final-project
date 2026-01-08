# 💰 Smart AI Expense Tracker

**An intelligent full-stack dashboard that uses AI to organize your spending.**

## 🚀 Overview
Managing expenses shouldn't be a chore. This application allows users to add expenses using natural language. Powered by **Google Gemini AI**, the system parses text like "Pizza for 60 NIS", extracts the item, amount, and category, and stores it in **MongoDB Atlas**.

## ✨ Features
- **AI-Powered Input**: Automatically parses unstructured text into structured data.
- **Visual Insights**: Dynamic donut charts showing spending distribution by category using **Recharts**.
- **Normalization**: Smart mapping of categories (e.g., merging "Food" and "אוכל").
- **Full CRUD**: View, add, and delete expenses in real-time.

## 🛠️ Tech Stack
- **Frontend**: React.js, Recharts, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **AI Engine**: Google Gemini API (1.5 Flash).



## 🛠️ Setup
1. Clone the repo: `git clone https://github.com/itaimagdasi/my-final-project.git`
2. Run `npm install` in both root and frontend folders.
3. Add your `.env` variables (see `.env.example`).
4. Start the server: `node index.js`

