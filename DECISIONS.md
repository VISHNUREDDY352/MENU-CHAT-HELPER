# DECISIONS.md — SpiceRoute

## What We Built
SpiceRoute is an online food ordering web app with an AI-powered menu assistant. Users log in via mobile OTP, browse 16 menu items across 4 categories, filter by diet/spice preference, ask the AI for personalized recommendations, add items to a cart, and place orders — all stored in a MySQL database on AWS RDS.

## How We Built It
We used **React + Bootstrap 5** for the frontend for rapid UI development with responsive layouts out of the box. **Django REST Framework** handles the backend API because Python made it straightforward to integrate the **Groq LLaMA 3.3 70B** model. The AI receives the full menu as context in its system prompt and is instructed to always append a machine-readable `SUGGEST: item1, item2` line — the backend parses this, maps names to IDs, and returns `suggested_item_ids` to the frontend, which uses a JavaScript `Set` for O(1) highlighting of matched cards. OTP is stored in a Python in-memory dictionary (suitable for hackathon scale).

## What We Skipped
- Real SMS gateway (OTP shown as demo hint instead of actual SMS)
- Payment gateway (Place Order is a UI action only — no Razorpay/UPI)
- Admin analytics dashboard
- JWT token authentication (using sessionStorage instead)
- Redis-backed OTP expiry

## What We'd Improve
- Replace in-memory OTP store with Redis + TTL expiry
- Integrate MSG91 for real SMS delivery
- Add Razorpay payment gateway
- Implement JWT auth with refresh tokens
- Add dish ratings and reviews
- Build a kitchen-side order management dashboard
- Deploy backend on AWS EC2 / ECS, frontend on Vercel

## Architecture Notes
The frontend communicates exclusively through Vite's `/api/` proxy to the Django backend — no hardcoded URLs. CSS theming uses a single `data-theme` attribute on `<html>` with CSS custom properties, so dark/light mode requires zero component changes. Cart state is maintained in `localStorage` for persistence across refreshes, while auth session uses `sessionStorage` to auto-clear on tab close. Orders are snapshotted at placement time (name + price stored in `OrderItem`) so historical records remain accurate even if menu prices change.
