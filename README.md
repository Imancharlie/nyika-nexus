# AGRIMIKA — Kilimo ni Maisha

Monorepo with a Django REST API (`backend/`) and a React app (`frontend/`).

```
agrimika/
├── backend/    Django 5 + Django REST Framework (SQLite now, PostgreSQL later)
└── frontend/   Vite + React + TypeScript + Tailwind (landing page, farmer app, admin panel)
```

## Run it locally

You need Python 3.11+ and Node 18+.

### 1. Backend (http://127.0.0.1:8000)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env              # then edit values (optional for local dev)
python manage.py migrate
python manage.py seed               # demo services, articles, experts, loans, products, groups, posts
python manage.py createsuperuser    # your admin account (asks for username, phone, password)
python manage.py runserver
```

### 2. Frontend (http://localhost:8080)

```powershell
cd frontend
npm install
npm run dev
```

The dev server forwards `/api` and `/media` to Django, so no extra configuration is needed.
To point a production build at another API, set `VITE_API_URL` (for example `https://api.agrimika.co.tz/api`).

## Where things are

| URL | What |
| --- | --- |
| `/` | Landing page for visitors, farmer dashboard once logged in |
| `/jisajili`, `/ingia` | Sign up / log in (username or phone + password), SW/EN switch |
| `/thibitisha`, `/sahau-nenosiri` | SMS code verification and password reset (active once Beem SMS is on) |
| `/bidhaa`, `/kikapu`, `/oda`, `/lipia`, `/omba-oda` | Shop, cart, my orders, payments, order requests |
| `/vikundi`, `/post`, `/jifunze`, `/huduma`, `/ushauri`, `/mikopo`, `/msaada` | Groups, community, learning, services, expert advice, loans, support |
| `/admin` | Custom admin panel. Staff accounts are sent here automatically after login |
| `/django-admin/` | Django's built-in admin (raw database access, backup tool) |

## Admin panel

Log in with a staff account (the superuser you created, or any user you switch to "Admin" under **Users**).

- **Overview**: farmers, revenue, orders, sign-up and revenue charts, things that need attention.
- **Users**: search, filter by region, deactivate accounts, grant admin, mark phones verified.
- **Orders**: update delivery status (farmer is notified), mark as paid, reply to order requests.
- **Payments**: confirm or reject payments while no gateway is connected.
- **Products / Services / Content**: manage the shop, service packages, articles, experts, loans, groups and posts.
- **Consultations / Support**: answer farmers' questions and help tickets.
- **SMS & Broadcasts**: send announcements to all farmers or one region (SMS and/or in-app), SMS log.
- **API settings**: Beem SMS and payment-gateway credentials.

### Turning on SMS (Beem Africa)

1. In your Beem dashboard, copy the **API key**, **Secret key** and your approved **Sender ID**.
2. Admin → **API settings** → SMS: paste them, click **Save**, send a test SMS, then switch it **On**.

From that moment new sign-ups receive a 6-digit code, unverified users are asked to verify at login,
"Forgot password" works by SMS, and broadcasts can go out by SMS. With SMS off, sign-up works without a code.

### Payments

No provider is chosen yet. Farmers can press "Lipa sasa"; the request appears in **Payments** for you to confirm
after receiving the money. When you choose a provider (e.g. Selcom, AzamPay, ClickPesa), enter its details under
**API settings → Payments** and adapt `backend/integrations/payments.py` to that provider's request format.
The webhook endpoint is `POST /api/payments/webhook/` with header `X-Webhook-Secret`.

### Security notes

- API keys are encrypted in the database (Fernet). Set `FIELD_ENCRYPTION_KEY` in `backend/.env` for production
  (generate one with the command in `.env.example`). Changing it later means re-entering the keys.
- Verification codes are stored hashed, expire after 10 minutes and allow 5 attempts.
- Phone numbers are stored as `+255XXXXXXXXX`; `0712 345 678`, `712345678` and `255712345678` are all accepted.

## Production checklist

- `DJANGO_DEBUG=false`, a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
- `DATABASE_URL=postgres://…` and `pip install "psycopg[binary]"`.
- `python manage.py collectstatic`, serve `backend/media/` for uploaded images.
- `npm run build` in `frontend/` and serve `frontend/dist/` (SPA fallback to `index.html`).

## Tests

```powershell
cd backend
.\.venv\Scripts\python manage.py test
```
