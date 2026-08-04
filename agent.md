# SpiceRoute — Agent Reference

> Full technical reference for AI agents, developers, and automated tools working on this codebase.

---

## Project Overview

**SpiceRoute** is a restaurant menu + AI chat web app built for a hackathon.
A customer scans a QR code, browses the menu, asks the AI assistant for recommendations, and adds items to a cart.

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Python 3.10+, Django 4.2, Django REST Framework |
| Database  | MySQL 8 on AWS RDS (PyMySQL driver)             |
| AI        | Groq API → `llama-3.3-70b-versatile`            |
| Frontend  | React 18, Vite 5, Bootstrap 5.3.3               |
| Icons     | Bootstrap Icons 1.11                            |
| Fonts     | Google Fonts: Inter (display), Mulish (UI)      |
| State     | React `useState` + `localStorage` (cart)        |

---

## Project Structure

```
Menu Chat/
├── agent.md                          ← this file
├── README.md                         ← team README (DB credentials)
├── challenges.md                     ← hackathon challenge brief
├── .gitattributes                    ← linguist overrides
├── .gitignore
│
├── backend/
│   ├── manage.py
│   ├── seed.py                       ← one-shot seeder (16 menu items)
│   ├── check_db.py                   ← DB connectivity check
│   ├── .env                          ← secrets (gitignored)
│   ├── restaurant/
│   │   ├── settings.py               ← Django config
│   │   ├── urls.py                   ← mounts /api/ → menu.urls
│   │   └── wsgi.py
│   └── menu/
│       ├── models.py                 ← MenuItem model
│       ├── serializers.py            ← ModelSerializer (all fields)
│       ├── views.py                  ← menu_list + chat endpoints
│       ├── urls.py                   ← /api/menu/ and /api/chat/
│       ├── migrations/
│       │   ├── 0001_initial.py
│       │   └── 0002_menuitem_calories.py
│       └── management/commands/
│           ├── fix_images.py         ← update image URLs in DB
│           └── seed_calories.py      ← seed calorie values
│
└── frontend/
    ├── index.html                    ← Bootstrap CDN + Google Fonts
    ├── vite.config.js                ← /api proxy → localhost:8000
    ├── package.json
    └── src/
        ├── main.jsx                  ← ReactDOM entry, imports Bootstrap CSS
        ├── App.jsx                   ← root state + layout
        ├── index.css                 ← entire design system
        └── components/
            ├── MenuGrid.jsx          ← menu cards, filters, breadcrumbs
            ├── Cart.jsx              ← sticky bar + offcanvas
            └── ChatPanel.jsx         ← AI chat card
```

---

## Running the Project

### Backend
```bash
cd backend
python manage.py runserver
# → http://127.0.0.1:8000
```

### Frontend
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:8000` so no CORS issues in dev.

### Seed / Utilities
```bash
# Seed menu items (run once)
python backend/seed.py

# Fix image URLs in DB
python backend/manage.py fix_images

# Seed calorie values
python backend/manage.py seed_calories

# Check DB connection
python backend/check_db.py
```

---

## Environment Variables (`backend/.env`)

| Key           | Description                        |
|---------------|------------------------------------|
| `GROQ_API_KEY`| Groq API key for LLM calls         |
| `DB_NAME`     | MySQL database name (default: team13) |
| `DB_USER`     | MySQL username                     |
| `DB_PASSWORD` | MySQL password                     |
| `DB_HOST`     | RDS endpoint                       |
| `DB_PORT`     | MySQL port (default: 3306)         |

---

## Database Model — `MenuItem`

Single table `menu_menuitem`. No cart, user, or order models — cart is frontend-only.

| Field         | Type                  | Notes                                      |
|---------------|-----------------------|--------------------------------------------|
| `id`          | BigAutoField (PK)     | auto-increment                             |
| `name`        | CharField(100)        |                                            |
| `description` | TextField             | blank=True                                 |
| `price`       | DecimalField(8,2)     | in INR (₹)                                 |
| `category`    | CharField(20)         | `starter` / `main` / `dessert` / `drink`  |
| `is_veg`      | BooleanField          | default False                              |
| `is_spicy`    | BooleanField          | default False                              |
| `image_url`   | URLField              | blank=True; direct Unsplash URLs           |
| `calories`    | PositiveIntegerField  | null/blank=True                            |

---

## API Endpoints

Base path: `/api/` (set in `restaurant/urls.py`)

### `GET /api/menu/`
Returns all menu items. No auth, no filtering, no pagination.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paneer Tikka",
    "description": "Grilled cottage cheese with spices",
    "price": "180.00",
    "category": "starter",
    "is_veg": true,
    "is_spicy": true,
    "image_url": "https://images.unsplash.com/...",
    "calories": 320
  }
]
```

---

### `POST /api/chat/`
AI menu assistant. Uses conversation history for context.

**Request:**
```json
{
  "message": "suggest something spicy under ₹300",
  "history": [
    { "role": "user", "text": "..." },
    { "role": "bot",  "text": "..." }
  ]
}
```
`history` is optional. The backend uses the last 6 turns; ChatPanel sends up to 10.

**Response:**
```json
{
  "reply": "Here are spicy options:\n- Chicken Wings (₹220, 430 kcal, Non-veg)...",
  "suggested": ["Chicken Wings", "Paneer Tikka"]
}
```

`suggested` is an array of **item names** (not IDs). `MenuGrid` matches these against `item.name` (case-insensitive) to highlight cards.

**AI Behaviour:**
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.2` (factual)
- Max tokens: `1000`
- Returns ALL matching items for a query, not just 2–3
- Appends `SUGGEST: item1, item2` as the last line of the raw LLM output; this is stripped before returning `reply`

---

## React Components

### `App` — Root
Owns all shared state. Fetches menu from `/api/menu/` on mount. Persists cart to `localStorage` under key `sr_cart`.

**State:**
- `menuItems[]` — all menu items from API
- `cart[]` — `[{...item, qty}]`
- `suggested[]` — item name strings from last chat response
- `loading` — boolean
- `showCart` — boolean (offcanvas open/close)

**Layout:**
- `.sr-fixed-top` — fixed header (navbar + cart bar, total 112px height)
- `.sr-body-layout` — fixed below header; `.sr-menu-col` (scrollable) + `.sr-chat-col` (fixed 380px)

---

### `MenuGrid`
**Props:** `{ items, suggested, onAdd }`

**State:** `vegOnly`, `spicyOnly`, `activeCat` (default `'all'`)

**Features:**
- Breadcrumb nav for category filtering
- Veg Only toggle + Spicy checkbox
- Bootstrap responsive grid: `row-cols-1 / row-cols-sm-2 / row-cols-md-3`
- Cards highlighted with `.highlighted` class when name matches `suggested[]`
- "AI Pick" badge (`bi-stars`) on highlighted cards
- Fallback images from Unsplash per category

---

### `Cart`
**Props:** `{ cart, onRemove, show, onToggle, onClose, itemCount, total }`

**Features:**
- Sticky bar showing count + total + "View Cart" button
- Bootstrap Offcanvas (360px, right side) with item list + "Place Order" button
- Backdrop overlay when open

---

### `ChatPanel`
**Props:** `{ onSuggest }`

**State:** `messages[]`, `input`, `loading`

**Features:**
- 5 quick prompt chips
- `clearChat()` — resets to greeting + clears highlights (calls `onSuggest([])`)
- Sends last 10 messages as `history` in each request
- Typing indicator (3 bouncing dots) while waiting
- Error bubble on API failure
- Auto-scrolls to bottom on new messages

---

## Design System (CSS)

All custom classes are prefixed with `sr-` to avoid Bootstrap collisions.

### Color Variables
```css
/* Brand */
--main:        #3377FF    /* primary buttons, borders, accents */
--main-dark:   #2659BF    /* hover state */
--main-light:  #99BBFF    /* text on dark bg */
--main-subtle: #CCE0FF    /* chip hover bg */

/* State */
--error:   #FF3B3B    /* non-veg badge, error */
--warning: #FFCC00    /* spicy badge */
--info:    #0063F7
--success: #06C270    /* veg badge, online dot, price */

/* Dark scale */
--dark-1: #3A3A3C    /* body text, navbar bg */
--dark-2: #6B7588
--dark-3: #8F90A6    /* placeholder, muted text */
--dark-4: #C7C9D9    /* borders, disabled */

/* Light scale */
--light-2: #E8EBF0    /* borders */
--light-3: #F2F2F5    /* page background */
--light-4: #FAFAFC    /* card background */
```

### Spacing Scale (8px base unit)
```css
--sp-1: 8px   --sp-2: 16px  --sp-3: 24px  --sp-4: 32px  --sp-5: 40px
--sp-6: 64px  --sp-7: 80px  --sp-8: 96px  --sp-9: 120px
--gutter: 30px
```

### Typography
```
Inter 200      → Display (48px, 40px)
Mulish 700     → Headings h1–h6 (44px → 16px), line-height 1.3
Mulish 400     → Body (.sr-lead 22px → .sr-body-sm 14px), line-height 1.7
Mulish 600     → Labels (.sr-label-xl 18px → .sr-label-xs 10px)
```

### Button Classes
```css
/* Size */
.btn-sr-sm   { padding: 12px 24px; font-size: 14px; }
.btn-sr-md   { padding: 14px 32px; font-size: 16px; }
.btn-sr-lg   { padding: 16px 48px; font-size: 18px; }

/* Variant */
.btn-sr-primary    /* bg #3377FF, white text */
.btn-sr-secondary  /* bg #F2F2F5, dark text, grey border */
.btn-sr-ghost      /* transparent bg, no border */
```
All variants have Default / Hover / Active / Focus / Disabled states.

### Input Classes
```css
.sr-input          /* base: white bg, #C7C9D9 border, 14px 16px padding */
.sr-input:focus    /* #3377FF border + ring */
.sr-input.is-error /* #FF3B3B border + ring */
.sr-input:disabled /* #E8EBF0 bg, cursor not-allowed */
.sr-input-label    /* Mulish 600 14px, above input */
.sr-input-hint     /* Mulish 400 12px, below input */
.sr-input-hint.is-error  /* red hint text */
```

### Component Classes
```css
.sr-toggle-*    /* custom toggle switch (Veg Only filter) */
.sr-checkbox    /* custom styled checkbox (Spicy filter) */
.sr-breadcrumb* /* category nav breadcrumbs */
.sr-chat-*      /* chat card, messages, input, header */
.sr-cartbar     /* sticky cart summary bar */
.sr-card        /* menu item card (extends Bootstrap .card) */
.sr-ai-badge    /* "AI Pick" overlay badge on highlighted cards */
```

---

## Seed Data (16 items)

| Category | Items |
|----------|-------|
| Starter  | Paneer Tikka (320 kcal), Chicken Wings (430 kcal), Veg Spring Rolls (180 kcal), Soup of the Day (110 kcal) |
| Main     | Butter Chicken (490 kcal), Dal Makhani (380 kcal), Veg Biryani (420 kcal), Chicken Biryani (550 kcal), Palak Paneer (360 kcal), Fish Curry (310 kcal) |
| Dessert  | Gulab Jamun (270 kcal), Ice Cream (230 kcal), Chocolate Brownie (410 kcal) |
| Drink    | Mango Lassi (190 kcal), Fresh Lime Soda (60 kcal), Masala Chai (80 kcal) |

---

## Key Conventions

1. **`sr-` CSS prefix** — all custom classes use this prefix; never override Bootstrap classes directly.
2. **Suggestion matching by name** — `suggested[]` contains item name strings; `MenuGrid` does `item.name.toLowerCase()` === `suggested[i].toLowerCase()` to highlight. The challenge spec asked for IDs — this is a deliberate divergence.
3. **SUGGEST: parsing** — the LLM appends a machine-readable `SUGGEST: item1, item2` line. The backend splits on `SUGGEST:`, strips it from `reply`, and returns `suggested[]` separately.
4. **History windowing** — frontend sends last 10 messages; backend slices to last 6 before Groq call to keep tokens bounded.
5. **Cart is pure frontend** — no backend cart or order model. State is `useState` initialized from `localStorage('sr_cart')`. Every mutation calls `saveCart()`.
6. **Vite proxy** — `/api` → `http://localhost:8000` in `vite.config.js`; no hardcoded API base URL anywhere in components.
7. **Minimal Django** — no admin, no sessions, no auth apps. CORS is open (`CORS_ALLOW_ALL_ORIGINS = True`) — fine for hackathon dev, must be tightened for production.
8. **Bootstrap + custom** — Bootstrap handles grid, offcanvas, badges, utilities. All bespoke UI (buttons, inputs, toggles, chat bubbles) uses custom `sr-*` CSS per the hackathon style guide.

---

## Known Limitations / Potential Improvements

| Area | Issue | Suggested Fix |
|------|-------|---------------|
| Suggestions | Matched by name string, not ID — fragile if names have typos | Add `suggested_ids` field to chat response |
| Auth | No authentication | Add JWT or session auth for order placement |
| Cart | No backend persistence | Add `Order` and `OrderItem` models |
| Place Order | Button is UI-only, no API call | Wire up `POST /api/orders/` |
| Production | `DEBUG=True`, `CORS_ALLOW_ALL_ORIGINS=True`, weak `SECRET_KEY` | Harden before deploy |
| images | `source.unsplash.com` URLs were deprecated; replaced with direct `images.unsplash.com` links | Maintain via `fix_images` management command |
