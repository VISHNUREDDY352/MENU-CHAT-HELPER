# SpiceRoute — Presentation Slides
## Team 13 | Internship League 4 Hackathon 2026

---

## Slide 1 — Title
**SpiceRoute 🍽️**
*AI-Powered Online Food Ordering App*
Team 13 | Internship League 4 | 2026

---

## Slide 2 — Problem Statement
### The Problem
- Traditional restaurant menus are slow and static
- No easy way to filter food by diet, spice level, or calories
- Customers can't get personalized recommendations instantly
- No real-time order tracking or history

---

## Slide 3 — Our Solution
### SpiceRoute — Online Food Ordering App
- Access from any device — desktop, laptop, or mobile browser
- OTP-based login — no password, just your phone number
- Browse full menu with Veg / Non-Veg / Spicy filters and live search
- AI assistant answers food queries: *"low calorie veg under ₹200"*
- Add to cart, adjust quantities, place order in seconds
- Order confirmation with estimated delivery time (30 min)
- Order history saved to your profile

---

## Slide 4 — Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Bootstrap 5 + Vite |
| Backend | Python Django 4.2 + REST Framework |
| Database | MySQL 8 on AWS RDS |
| AI Model | Groq API — LLaMA 3.3 70B |
| Auth | Mobile OTP (phone-based, no password) |
| Hosting | Local dev / deployable to cloud |

---

## Slide 5 — Architecture
```
User Browser (React + Bootstrap)
        ↓  /api/* (Vite proxy)
  Django REST Framework
        ↓
  MySQL on AWS RDS   ←→   Groq LLaMA 3.3 70B
```

**Key design decisions:**
- Vite proxy — no hardcoded backend URLs in frontend
- CSS custom properties for theming — zero JS needed for dark/light mode
- Price snapshot in OrderItem — historical accuracy even if menu changes

---

## Slide 6 — AI Prompt Design
### How the AI Suggestion Works

**Step 1:** Backend builds the full menu as plain text and injects it into the system prompt
```
MENU:
- Paneer Tikka | ₹180 | starter | veg | spicy | 320kcal
- Chicken Wings | ₹220 | starter | non-veg | spicy | 430kcal
...
```

**Step 2:** Strict rules in the system prompt:
- Only suggest items from the menu above
- List ALL matching items, not just 2-3
- End reply with: `SUGGEST: item1, item2, item3`

**Step 3:** Backend parses `SUGGEST:` line → maps item names to IDs → returns `suggested_item_ids`

**Step 4:** Frontend uses a JavaScript `Set` (O(1) lookup) to highlight matched cards with blue border + "AI Pick" badge

---

## Slide 7 — Key Features (with Demo Flow)
1. 🎬 Login page with looping food background video
2. 📱 Mobile OTP login — 6-box input, auto-advance, paste support
3. 🔍 Live search in navbar center — filters by name/description/category
4. 🤖 AI chat — ask in natural language, cards highlight on menu
5. 🛒 Cart — add, adjust qty with − + controls, persists on refresh
6. ✅ Order confirmation modal — animated, 30 min delivery, auto-closes
7. 👤 Profile dropdown — edit name, full order history
8. 🌙 Dark / Light mode — saved to localStorage

---

## Slide 8 — Database Design
### 4 Tables in MySQL

| Table | Purpose |
|-------|---------|
| `menu_menuitem` | 16 food items — name, price, category, calories, veg/spicy |
| `menu_customer` | Customer phone + name — created on first OTP login |
| `menu_order` | Order linked to customer, total, timestamp |
| `menu_orderitem` | Items in each order — name+price snapshotted at time of order |

**Why snapshot?** If menu price changes tomorrow, old order history stays accurate.

---

## Slide 9 — What We Skipped
| Feature | Reason |
|---------|--------|
| Real SMS OTP | No paid SMS gateway (MSG91/Twilio) — OTP shown as demo hint |
| Payment gateway | Razorpay integration needs merchant account — Place Order is UI only |
| Redis OTP store | In-memory dict sufficient for hackathon scale |
| JWT auth | SessionStorage adequate for demo — would add for production |
| Admin analytics | Out of scope for hackathon timeline |

---

## Slide 10 — What We'd Improve
- 💳 Razorpay / UPI payment integration
- 📲 Real SMS delivery via MSG91
- 🔐 JWT token auth with refresh tokens
- 📊 Kitchen dashboard for order management
- ⭐ Dish ratings and reviews per item
- 🌐 Multi-language support (Hindi, Telugu)
- 🚀 Deploy: Django on AWS EC2, React on Vercel

---

## Slide 11 — Thank You
### SpiceRoute 🍽️
*Fine Dining Experience — Online*

**Team 13 | Internship League 4**
GitHub: [github.com/internship-league4/team13](https://github.com/internship-league4/team13)

> Built with React • Django • MySQL • Groq AI
