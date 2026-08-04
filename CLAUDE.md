# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

**SpiceRoute** (repo name "Menu Chat") is a hackathon full-stack app: a restaurant menu browser with an AI chat assistant. Users browse a menu grid, ask an AI ("suggest something spicy under ₹300") for recommendations, see matching dishes highlighted, and add items to a frontend-only cart.

A more exhaustive technical reference already exists at [agent.md](agent.md) — read it for full API contracts, CSS design-system details, and component prop tables. This file focuses on what's needed to work in the codebase day to day.

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, Django 4.2, Django REST Framework |
| Database | MySQL 8 on AWS RDS, via PyMySQL driver |
| AI | Groq API, `llama-3.3-70b-versatile` |
| Frontend | React 18, Vite 5, Bootstrap 5.3.3 |

## Running the Project

```bash
# Backend — http://127.0.0.1:8000
cd backend
python manage.py runserver

# Frontend — http://localhost:5173
cd frontend
npm run dev
```

Vite proxies `/api/*` → `http://localhost:8000` ([vite.config.js](frontend/vite.config.js)), so there's no CORS issue in dev and no hardcoded API base URL anywhere in the frontend.

Utility scripts:
```bash
python backend/seed.py                          # one-shot seed (16 menu items)
python backend/manage.py fix_images              # repair image_url values in DB
python backend/manage.py seed_calories           # backfill calories column
python backend/check_db.py                       # verify DB connectivity
```

## Environment

Backend secrets live in `backend/.env` (gitignored, loaded explicitly in [settings.py](backend/restaurant/settings.py)): `GROQ_API_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`. Never commit this file or print its contents. DB credentials for this hackathon's shared RDS instance are documented in [README.md](README.md) — treat them as sensitive even though they're in the repo.

## Architecture

```
backend/restaurant/   Django project (settings, root urls → /api/ → menu.urls)
backend/menu/         single app: models.py, serializers.py, views.py, urls.py
frontend/src/
  App.jsx             owns all state (menuItems, cart, suggested, loading, showCart)
  components/
    MenuGrid.jsx       menu cards, category breadcrumbs, veg/spicy filters
    Cart.jsx           sticky bar + Bootstrap offcanvas
    ChatPanel.jsx      chat UI, sends message + history to /api/chat/
  index.css            entire custom design system (sr- prefixed classes)
```

There is exactly one DB table, `MenuItem` ([models.py](backend/menu/models.py)): `name`, `description`, `price`, `category` (`starter`/`main`/`dessert`/`drink`), `is_veg`, `is_spicy`, `image_url`, `calories`. No user, cart, or order models — the cart is pure frontend state persisted to `localStorage` under key `sr_cart`.

## API Endpoints

Only two, both in [menu/views.py](backend/menu/views.py):

- `GET /api/menu/` — returns all menu items, no filtering/pagination.
- `POST /api/chat/` — body `{ message, history? }`. Sends the full menu + last 6 history turns to Groq, expects the LLM to append a `SUGGEST: item1, item2` line to its reply. The view strips that line and returns `{ reply, suggested }`, where `suggested` is an array of **item name strings** (not IDs).

## Key Conventions (see [agent.md](agent.md) for full detail)

1. **Suggestion matching is by name, not ID.** `MenuGrid` does a case-insensitive match of `item.name` against `suggested[]` strings to decide highlighting. This is a deliberate divergence from the original challenge spec (which asked for `suggested_item_ids`) — don't "fix" it to use IDs without checking with the user, since the backend/frontend contract was intentionally changed together.
2. **`sr-` CSS prefix.** All custom classes in `index.css` use this prefix. Never override Bootstrap classes directly; add a new `sr-*` class instead.
3. **History windowing.** Frontend sends the last 10 chat messages; backend further slices to the last 6 before calling Groq. Keep both in sync if changing context length.
4. **Cart total is derived, not stored.** `App.jsx` computes `itemCount`/`total` from the `cart` array on every render — don't reintroduce a separate total state field.
5. **Minimal Django on purpose.** No admin, no auth, no sessions app. `CORS_ALLOW_ALL_ORIGINS = True` and `DEBUG = True` are acceptable for this hackathon but should not be copied into any production-facing fork without hardening (see Known Limitations in agent.md).

## Known Limitations

Documented in detail in [agent.md](agent.md#known-limitations--potential-improvements): suggestion-by-name is fragile to typos, there's no auth, the cart has no backend persistence, "Place Order" is UI-only with no API behind it, and `DEBUG`/`CORS_ALLOW_ALL_ORIGINS`/`SECRET_KEY` need hardening before any real deployment.
