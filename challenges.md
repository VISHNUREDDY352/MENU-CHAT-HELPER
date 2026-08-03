# FS-3: Menu Chat Helper (Full Stack) — Participant Problem Statement

## Overview

Build a small full-stack app for browsing a restaurant menu with an AI chat assistant. On the left is the menu (grid of dishes). On the right is a chat panel where the user can ask things like *"suggest something spicy under 300 rupees"* or *"what's a good vegetarian starter?"* The AI answers in one line and highlights suggested dishes in the menu grid. Users can add items to a cart shown at the top of the page.

## Technology Stack (Required)

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Bootstrap 5 |
| Backend | Python 3.10+, Django 4.x, Django REST Framework |
| Database | MySQL 8.x |
| AI | Any LLM API (OpenAI, Groq, Gemini, or Anthropic — free tier is fine). |
| Version control | Git + GitHub |

## What You'll Learn

Sending a large context (the whole menu) to an LLM, parsing structured JSON responses, keeping frontend state (cart) in sync with UI actions, and building a two-column responsive layout with Bootstrap.

## Recommended Tips

You're responsible for setting up the entire project yourself — the Django backend, the React frontend, the database, and your seed menu data. The following are a few optional tips that may save you time; use them at your discretion:

- Configure `settings.py` for MySQL and CORS before writing endpoint logic.
- Write your own menu seed data (roughly 20-25 items across a few categories) so you have something realistic to test the grid and chat against.
- Draft and test your LLM prompt in isolation before wiring it into the endpoint — it's much easier to iterate on prompt wording that way.
- Build your chat message component (user vs. assistant bubbles) early, since the whole chat panel depends on it.
- Keep your LLM API key in a `.env` file, excluded from version control.

## Database Model (MySQL)

You need exactly **one table**. Cart lives entirely on the frontend (React state + localStorage) — no cart table needed.

```sql
CREATE TABLE menu_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(300) NOT NULL,
    price         DECIMAL(6,2) NOT NULL,
    category      VARCHAR(50) NOT NULL,     -- starter, main, dessert, drink
    is_veg        BOOLEAN NOT NULL DEFAULT TRUE,
    is_spicy      BOOLEAN NOT NULL DEFAULT FALSE,
    image_url     VARCHAR(500) DEFAULT NULL
);
```

Django model (put in `menu/models.py`):

```python
class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('starter', 'Starter'),
        ('main', 'Main'),
        ('dessert', 'Dessert'),
        ('drink', 'Drink'),
    ]
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_veg = models.BooleanField(default=True)
    is_spicy = models.BooleanField(default=False)
    image_url = models.URLField(blank=True, null=True)
```

Seed the table with your own data (roughly 20-25 items), either via a data migration or a SQL script you write yourself.

## APIs You Must Build (Django REST Framework)

Only **two endpoints**.

### 1. `GET /api/menu/` — Return the full menu

No filters, no pagination. Just all items.

Response (200):
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "name": "Paneer Butter Masala",
      "description": "Creamy tomato-based paneer curry.",
      "price": 250.00,
      "category": "main",
      "is_veg": true,
      "is_spicy": false,
      "image_url": "https://example.com/paneer.jpg"
    }
  ]
}
```

### 2. `POST /api/chat/` — Ask the assistant

Request body:
```json
{ "message": "suggest something spicy under 300 rupees" }
```

What your backend does:
1. Load all menu items from MySQL.
2. Build a prompt that includes the message and a compact list of menu items with their IDs, names, prices, and tags.
3. Call the LLM asking it to respond as a JSON object with two keys: `answer` (one short sentence) and `suggested_item_ids` (array of 1-3 integers from the menu).
4. Parse the JSON response. If parsing fails, return `answer: "Sorry, I couldn't come up with a suggestion. Please try rephrasing."` and `suggested_item_ids: []`.
5. Return the result.

Response (200):
```json
{
  "answer": "Try the Chicken Chettinad — spicy, filling, and under your budget.",
  "suggested_item_ids": [7, 12]
}
```

Sample prompt (adapt as needed):
```
You are a helpful restaurant menu assistant. Given the user's message and
the menu below, respond with a JSON object with exactly two keys:
"answer": one short helpful sentence (max 25 words)
"suggested_item_ids": array of 1 to 3 integer IDs from the menu that match

Menu:
[1] Paneer Butter Masala - Rs.250 - main - veg - mild
[2] Chicken Biryani - Rs.320 - main - non-veg - spicy
...

User: {message}

Return ONLY the JSON object, no other text.
```

## Frontend Requirements (React + Bootstrap)

Build **one page** with three sections. Use a Bootstrap grid: cart at top full-width, then menu (left, 8 columns on desktop) and chat (right, 4 columns on desktop). On mobile, stack them vertically.

### Section 1 — Cart Bar (top, sticky)
A slim Bootstrap navbar-style bar showing "🛒 Cart: 3 items · Total ₹740" and a "View" button that opens a Bootstrap Offcanvas or Modal listing cart items with quantity and a remove button. Cart state lives in React and persists to `localStorage` so a refresh doesn't lose it.

### Section 2 — Menu Grid (left)
A responsive Bootstrap grid (3 columns desktop, 2 tablet, 1 mobile) of dish cards. Each card shows the image (use `image_url`; fall back to a placeholder if empty), name, one-line description, price, badges for "Veg"/"Non-veg" and "Spicy" if applicable, and an "Add to cart" button. When a chat response includes an item's ID in `suggested_item_ids`, that card gets a highlighted border (e.g., yellow glow) and stays highlighted until the next chat message.

### Section 3 — Chat Panel (right)
A Bootstrap card containing a scrollable message list (user messages on right, assistant messages on left with different background colors) and a text input with a "Send" button at the bottom. On send: append the user message, POST to `/api/chat/`, show a "typing…" indicator while waiting, then append the assistant's `answer` and update the highlighted item IDs in the menu grid. If the API fails, show an error bubble in the chat.

**Not required:** order placement, payment, user login, chat history persistence across refresh, voice input, streaming responses.

## Acceptance Criteria

1. Backend runs with `python manage.py runserver` and connects to MySQL with the seeded menu.
2. Frontend runs with `npm run dev` without CORS errors.
3. `GET /api/menu/` returns your seeded items and they display correctly in the grid.
4. Sending a chat message shows the assistant response in the chat panel within a reasonable time.
5. Suggested items are visibly highlighted in the menu grid after each chat response.
6. Adding items to cart updates the cart bar count and total correctly.
7. Cart survives a page refresh (localStorage).
8. Removing items from cart works and the total updates.
9. If the LLM returns malformed JSON, the app does not crash — it shows the fallback message.
10. README explains setup for MySQL, Django, and React.

## Stretch Goals (Optional, +5 bonus each, max +10)

- Simple category filter buttons above the menu grid (All / Starter / Main / Dessert / Drink)
- "Clear chat" button that resets the conversation and clears highlights
- Show a small "Suggested by AI" badge on highlighted cards

## Setup Cheat Sheet

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install django djangorestframework mysqlclient django-cors-headers python-dotenv
# create a .env file with your LLM API key
mysql -u root -p -e "CREATE DATABASE zap_menu CHARACTER SET utf8mb4;"
python manage.py migrate
# seed your menu_items table with your own data
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm create vite@latest . -- --template react
npm install bootstrap
npm run dev
```

## Important Notes

- **Keep the prompt small.** Include only fields the model actually needs (id, name, price, veg/non-veg, spicy). Don't send image URLs or long descriptions to the LLM — it wastes tokens and slows the response.
- **Always ask for JSON output** and always wrap `json.loads()` in a try/except. LLMs occasionally add stray text.
- **Cart math is a common bug source.** Compute the total on every render from the cart array — don't maintain a separate `total` state.

## Submission

Push to a public GitHub repo. Include:
- README.md with setup instructions and execution instructions for backend and frontend
- A screenshot of your app in the README
- Source code, API files, documentation, and all database table creation scripts
- A short `DECISIONS.md` (150-300 words) and a PPT for your presentation — covering what you built, how you built it, what you skipped, what you'd improve, and architecture notes (including your prompt design and suggestion-highlighting logic)
