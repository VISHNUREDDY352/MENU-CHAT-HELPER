# SpiceRoute 🍽️

> AI-Powered Restaurant Menu & Ordering System — Team 13 | Internship League 4 Hackathon 2026

---

## Database Credentials

Kindly use the following credentials and update them in the backend `.env` file.

- **Host:** `hackathondb.cvuouqwaej9d.ap-south-1.rds.amazonaws.com`
- **Port:** `3306`
- **Database:** `team13`
- **Username:** `team13`
- **Password:** `d6f9a3c90981d419`

> Please refer to `challenges.md` for hackathon challenge details and `Frontend_And_Backend_Run_Instructions.pdf` for setup instructions.

---

## Project Overview

SpiceRoute is a smart digital restaurant menu app. Customers can access it on any device — desktop, laptop, or mobile — log in with their mobile OTP, browse the menu, ask an AI assistant for recommendations, and place orders seamlessly.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite 5, Bootstrap 5.3         |
| Backend   | Python 3.10, Django 4.2, DRF            |
| Database  | MySQL 8 on AWS RDS                      |
| AI        | Groq API — LLaMA 3.3 70B                |
| Auth      | Mobile OTP (phone-based, no password)   |
| Icons     | Bootstrap Icons 1.11                    |
| Fonts     | Google Fonts — Inter + Mulish           |

---

## Features

- 📱 **Mobile OTP Login** — Enter phone number, verify 6-digit OTP
- 🤖 **AI Chat Assistant** — Ask in natural language: *"spicy veg under ₹200"*
- 🔍 **Smart Search** — Search by dish name, description, or category
- 🥗 **Smart Filters** — Veg / Non-Veg / Spicy toggles + category dropdown
- 🛒 **Cart** — Add items, adjust quantity, remove — persists across refresh
- ✅ **Order Confirmation** — Modal with delivery estimate (30 min)
- 👤 **Profile** — Edit display name, view full order history
- 🌙 **Dark / Light Mode** — Preference saved to localStorage
- 🎬 **Video Login Page** — Looping food background video

---

## Project Structure

```
Menu Chat/
├── backend/               Django REST API
│   ├── menu/              Models, views, serializers, admin
│   │   └── migrations/    DB migration files
│   └── restaurant/        Django settings, URLs
└── frontend/              React + Vite app
    ├── public/            Static assets (bg.mp4)
    └── src/
        ├── App.jsx        Root component + state
        ├── index.css      Full design system
        └── components/
            ├── Login.jsx          OTP login flow
            ├── MenuGrid.jsx       Menu cards + filters + search
            ├── Cart.jsx           Cart bar + offcanvas
            ├── ChatPanel.jsx      AI chat
            ├── ProfileDropdown.jsx Profile + order history
            └── Toast.jsx          Notifications
```

---

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt   # if requirements.txt exists
python manage.py migrate
python manage.py runserver
# → http://127.0.0.1:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:8000` automatically.

### Seed Data
```bash
# Seed 16 menu items
python backend/seed.py

# Fix image URLs in DB
python backend/manage.py fix_images

# Seed calorie values
python backend/manage.py seed_calories
```

---

## API Endpoints

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| GET    | `/api/menu/`                    | All menu items               |
| POST   | `/api/auth/send-otp/`           | Send OTP to phone            |
| POST   | `/api/auth/verify-otp/`         | Verify OTP, get customer     |
| PATCH  | `/api/auth/customer/<id>/`      | Update customer name         |
| POST   | `/api/orders/`                  | Place an order               |
| GET    | `/api/orders/<customer_id>/`    | Get order history            |
| POST   | `/api/chat/`                    | AI chat (Groq)               |

---

## Admin Panel

Access Django admin at `http://127.0.0.1:8000/admin/`

Default superuser: `admin` / `admin123`

Manage: Menu Items, Customers, Orders

---

## Team

**Team 13 — Internship League 4**
GitHub: [internship-league4/team13](https://github.com/internship-league4/team13)
