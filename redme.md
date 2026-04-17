# 📝 Modern Todo Web App

A professional, production-ready To-Do List application built with a **Serverless Architecture**. It uses **Google Sheets** as a database and **GitHub Pages** for free hosting.

## 🚀 Features

- **Google OAuth Login:** Secure authentication.
- **Google Sheets Integration:** Real-time data storage using Google Apps Script.
- **Multi-List Support:** Organize tasks into different categories.
- **Task Management:** CRUD operations (Create, Read, Update, Delete).
- **Dark Mode:** System-aware dark/light theme toggle.
- **Responsive Design:** Optimized for Mobile, Tablet, and Desktop.
- **Animations:** Smooth UI transitions and loading states.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript.
- **Backend:** Google Apps Script (Web App API).
- **Database:** Google Sheets.
- **Deployment:** GitHub Pages.

## ⚙️ Setup Instructions

### 1. Database Setup

1. Create a Google Sheet with three tabs: `Users`, `Lists`, and `Tasks`.
2. Add the headers provided in the setup guide to Row 1 of each tab.

### 2. Backend Deployment

1. Go to **Extensions > Apps Script** in your Google Sheet.
2. Paste the provided `Code.gs` (Apps Script) code.
3. Click **Deploy > New Deployment**. Select **Web App**.
4. Set access to **"Anyone"**.
5. Copy the **Web App URL**.

### 3. Frontend Configuration

1. Open `js/api.js` and paste your Web App URL into the `API_URL` constant.
2. Open `index.html` and paste your **Google Client ID** into the `data-client_id` attribute.

### 4. GitHub Deployment

1. Create a new repository on GitHub.
2. Upload all files.
3. Go to **Settings > Pages** and enable deployment from the `main` branch.

---

**© Sagar Dulal | Owner: [Sagar Dulal](https://sagardulal09.github.io/SagarDulal/)**
