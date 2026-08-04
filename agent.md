# SpiceRoute — Agent Reference

> Full technical reference for AI agents, developers, and automated tools working on this codebase.

---

## Project Overview

**SpiceRoute** is a restaurant menu + AI chat web app built for a hackathon.
A customer scans a QR code, logs in via OTP, browses the menu, asks the AI assistant for recommendations, and adds items to a cart.

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Python 3.10+, Django 4.2, Django REST Framework |
| Database  | MySQL 8 on AWS RDS (PyMySQL driver)             |
| AI        | Groq API → `llama-3.3-70b-versatile`            |
| Frontend  | React 18, Vite 5, Bootstrap 5.3.3               |
| Icons     | Bootstrap Icons 1.11                            |
| Fonts     | Google Fonts: Inter (display), Mulish (UI)      |
| State     | React `useState` + `localStorage` (cart/orders) |

---

## Project Structure

```
Menu Chat/
├── agent.md
├── README.md
├── CLAUDE.md
├── .gitattributes
├── .gitignore
│
├── backend/
│   ├── manage.py
│   ├── seed.py
│   ├── check_db.py
│   ├── .env                          ← secrets (gitignored)
│   ├── restaurant/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── menu/
│       ├── models.py                 ← MenuItem, Customer, Order, OrderItem
│       ├── serializers.py
│       ├── views.py                  ← all API endpoints
│       ├── urls.py
│       ├── admin.py                  ← all models registered
│       ├── migrations/
│       │   ├── 0001_initial.py
│       │   ├── 0002_menuitem_calories.py
│       │   └── 0003_add_customer_order.py
│       └── management/commands/
│           ├── fix_images.py
│           └── seed_calories.py
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── public/
    │   └── bg.mp4                    ← login background video
    └── src/
        ├── main.jsx
        ├── App.jsx                   ← root state + layout + auth
        ├── index.css                 ← entire design system
        └── components/
            ├── Login.jsx             ← OTP login (calls backend)
            ├── MenuGrid.jsx          ← menu cards, filters, search
            ├── Cart.jsx              ← cart bar + offcanvas
            ├── ChatPanel.jsx         ← AI chat card
            ├── ProfileDropdown.jsx   ← profile, edit name, order history
            └── Toast.jsx             ← toast notifications
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
# → http://localhost:5173 (or :5174)
```

Vite proxies `/api/*` → `http://localhost:8000`.

---

## Environment Variables (`backend/.env`)

| Key           | Description                          |
|---------------|--------------------------------------|
| `GROQ_API_KEY`| Groq API key for LLM calls           |
| `DB_NAME`     | MySQL database name (default: team13) |
| `DB_USER`     | MySQL username                       |
| `DB_PASSWORD` | MySQL password                       |
| `DB_HOST`     | RDS endpoint                         |
| `DB_PORT`     | MySQL port (default: 3306)           |

---

## Database Models

### `MenuItem`
| Field       | Type                | Notes                                    |
|-------------|---------------------|------------------------------------------|
| `id`        | BigAutoField (PK)   |                                          |
| `name`      | CharField(100)      |                                          |
| `description`| TextField          | blank=True                               |
| `price`     | DecimalField(8,2)   | INR                                      |
| `category`  | CharField(20)       | starter/main/dessert/drink               |
| `is_veg`    | BooleanField        |                                          |
| `is_spicy`  | BooleanField        |                                          |
| `image_url` | URLField            | direct `images.unsplash.com/photo-...` URL |
| `calories`  | PositiveIntegerField| null/blank                               |

### `Customer`
| Field       | Type              | Notes              |
|-------------|-------------------|--------------------|
| `id`        | BigAutoField (PK) |                    |
| `phone`     | CharField(10)     | unique             |
| `name`      | CharField(100)    | blank=True         |
| `created_at`| DateTimeField     | auto               |
| `updated_at`| DateTimeField     | auto               |

### `Order`
| Field       | Type              | Notes                        |
|-------------|-------------------|------------------------------|
| `id`        | BigAutoField (PK) |                              |
| `customer`  | FK → Customer     | CASCADE                      |
| `total`     | DecimalField(10,2)|                              |
| `created_at`| DateTimeField     | auto                         |

### `OrderItem`
| Field      | Type              | Notes                          |
|------------|-------------------|--------------------------------|
| `id`       | BigAutoField (PK) |                                |
| `order`    | FK → Order        | CASCADE                        |
| `menu_item`| FK → MenuItem     | SET_NULL (snapshot by name)    |
| `name`     | CharField(100)    | snapshot at order time         |
| `price`    | DecimalField(8,2) | snapshot at order time         |
| `qty`      | PositiveIntegerField |                             |

---

## API Endpoints

Base path: `/api/`

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/menu/`                  | All menu items                     |
| POST   | `/api/auth/send-otp/`         | Generate OTP, save in memory       |
| POST   | `/api/auth/verify-otp/`       | Verify OTP, create/get Customer    |
| PATCH  | `/api/auth/customer/<id>/`    | Update customer name               |
| POST   | `/api/orders/`                | Place a new order                  |
| GET    | `/api/orders/<customer_id>/`  | Get order history for customer     |
| POST   | `/api/chat/`                  | AI chat (Groq)                     |

---

## Frontend Components

### `App` — Root
Owns all shared state. Handles auth gating (shows `Login` if no user in sessionStorage).

**State:** `user`, `menuItems[]`, `cart[]`, `suggested[]`, `loading`, `showCart`, `theme`, `orderHistory[]`

**Key functions:**
- `handleLogin(userData)` — saves to sessionStorage + state
- `handleLogout()` — clears sessionStorage + resets all state
- `handleUpdateUser(updated)` — saves name to sessionStorage + calls `PATCH /api/auth/customer/<id>/`
- `placeOrder()` — saves order to localStorage + calls `POST /api/orders/`
- `toggleTheme()` — switches light/dark, persists to localStorage

---

### `Login`
Two-step OTP flow:
1. **PhoneStep** — calls `POST /api/auth/send-otp/`, shows demo OTP hint
2. **OTPStep** — 6-box input, calls `POST /api/auth/verify-otp/`, auto-submits on fill, paste support, resend timer

---

### `MenuGrid`
**Props:** `{ items, suggested, onAdd, cart, onRemove, search }`

**Features:**
- Hamburger dropdown for category filter (All/Starters/Main/Desserts/Drinks)
- Veg / Non-Veg (mutually exclusive) + Spicy toggles
- Search prop filters by name, description, category across all categories
- 4 cards per row on desktop (`row-cols-lg-4`)
- `− qty +` pill controls on cards when item is in cart
- AI Pick badge on highlighted cards

---

### `Cart`
**Props:** `{ cart, onAdd, onRemove, onDecrement, show, onToggle, onClose, itemCount, total, theme, onToggleTheme, onPlaceOrder }`

**Features:**
- Sticky cart bar: count + total + View Cart button + theme toggle icon
- Offcanvas: item rows with image, name, `− qty +` pill, line total, trash
- Footer: total + Place Order button (calls `placeOrder()` in App)

---

### `ChatPanel`
- Collapsible header (click to expand/collapse with slide animation)
- 5 quick prompt chips
- Sends last 10 messages as history
- Calls `POST /api/chat/`, highlights suggested items by ID

---

### `ProfileDropdown`
**Props:** `{ user, onUpdateUser, onLogout, orderHistory }`

- Avatar pill button in navbar (initials + name)
- Dropdown with Profile tab + Orders tab
- Profile tab: show phone (read-only), edit name inline
- Orders tab: list of past orders with items, date, total
- Logout button at footer

---

## Design System

All custom classes use `sr-` prefix.

### Theme Tokens
Two themes via `data-theme` on `<html>`:

| Token             | Light           | Dark       |
|-------------------|-----------------|------------|
| `--surface-bg`    | `#F2F2F5`       | `#111113`  |
| `--surface-card`  | `#FAFAFC`       | `#1C1C1E`  |
| `--surface-border`| `#E8EBF0`       | `#2C2C2E`  |
| `--surface-input` | `#FFFFFF`       | `#2C2C2E`  |
| `--surface-nav`   | `#3A3A3C`       | `#0A0A0C`  |
| `--text-primary`  | `#3A3A3C`       | `#F2F2F5`  |
| `--text-muted`    | `#8F90A6`       | `#6B7588`  |
| `--main`          | `#3377FF`       | (same)     |
| `--success`       | `#06C270`       | (same)     |
| `--error`         | `#FF3B3B`       | (same)     |

### Key Component Classes
```
.sr-nav-*          navbar + brand + search
.sr-cat-*          hamburger category dropdown
.sr-filter-bar     veg/non-veg/spicy toggles
.sr-card           menu item card
.sr-qty-control    − qty + pill on cards and in cart
.sr-chat-*         chat card, messages, header, input
.sr-profile-*      profile dropdown
.sr-login-*        login page
.sr-otp-*          OTP input boxes
.sr-toast-*        toast notifications
.sr-cartbar        sticky cart summary bar
```

---

## Key Conventions

1. **`sr-` CSS prefix** — never override Bootstrap classes directly
2. **Suggestion matching by ID** — `suggested[]` = int array of item IDs; `MenuGrid` uses a `Set` for O(1) lookup
3. **SUGGEST: parsing** — LLM appends `SUGGEST: item1, item2`; backend strips it, resolves names→IDs, returns `suggested_item_ids`
4. **Cart is frontend** — `useState` + `localStorage('sr_cart')`; no backend cart model
5. **Orders are dual** — saved to `localStorage` for instant UI + `POST /api/orders/` for DB persistence
6. **Auth is session-scoped** — `sessionStorage('sr_user')` cleared on tab close
7. **Theme persists** — `localStorage('sr_theme')`
8. **OTP is in-memory** — `_otp_store = {}` dict in `views.py`; production should use Redis
9. **Image URLs** — must be direct CDN URLs (`images.unsplash.com/photo-...`), NOT Unsplash page/share URLs
10. **Video background** — `frontend/public/bg.mp4` served statically by Vite

---

## Seed Data (16 items)

| Category | Items |
|----------|-------|
| Starter  | Paneer Tikka, Chicken Wings, Veg Spring Rolls, Soup of the Day |
| Main     | Butter Chicken, Dal Makhani, Veg Biryani, Chicken Biryani, Palak Paneer, Fish Curry |
| Dessert  | Gulab Jamun, Ice Cream, Chocolate Brownie |
| Drink    | Mango Lassi, Fresh Lime Soda, Masala Chai |

---

## Known Limitations

| Area | Issue | Fix |
|------|-------|-----|
| OTP  | In-memory store, lost on server restart | Use Redis or DB-backed OTP table |
| SMS  | No real SMS gateway | Integrate MSG91 / Twilio |
| Auth | No JWT/token — just sessionStorage | Add DRF token auth for production |
| Cart | No backend persistence | Add Order flow to backend (partially done) |
| Images | Unsplash CDN URLs may break | Self-host or use a paid image CDN |
| CORS | `CORS_ALLOW_ALL_ORIGINS = True` | Restrict to production domain |
| DEBUG | `DEBUG = True` | Set False + configure proper SECRET_KEY for production |
