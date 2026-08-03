# 🍽️ SpiceRoute — Restaurant Menu + AI Chat

Full-stack app: React (Vite) + Bootstrap 5 frontend, Django + DRF backend, MySQL, Groq AI.

## Project Structure

```
Menu Chart Helper/
├── backend/
│   ├── manage.py
│   ├── seed.py
│   ├── .env                  ← put your keys here
│   ├── restaurant/           ← Django project
│   │   ├── settings.py
│   │   └── urls.py
│   └── menu/                 ← Django app
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       └── migrations/
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── components/
            ├── Cart.jsx
            ├── MenuGrid.jsx
            └── ChatPanel.jsx
```

---

## Setup

### 1. MySQL — create the database

```sql
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4;
```

### 2. Backend

```bash
cd backend

# Install dependencies
pip install django djangorestframework django-cors-headers groq python-dotenv pymysql

# Edit .env — fill in your keys:
#   GROQ_API_KEY  → https://console.groq.com  (free)
#   DB_PASSWORD   → your MySQL root password

# Run migrations
python manage.py migrate

# Seed menu data
python seed.py

# Start server
python manage.py runserver
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Get a free Groq API key

1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Paste it in `backend/.env` as `GROQ_API_KEY=...`

---

## Features

- **Menu grid** — grouped by category (Starters, Mains, Desserts, Drinks)
- **AI chat** — ask in plain English, get one-line answers
- **Highlights** — AI-suggested dishes get a ✨ glow on the grid
- **Cart** — add items, see running total at the top
