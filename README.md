# CYBR2310 Week 9 — $1 Payment Web Application

A minimal Node.js/Express app using **Stripe Hosted Checkout** for a $1.00 test payment.

---

## Project Structure

```
payment-app/
├── server.js          ← Express backend (creates Stripe sessions, serves pages)
├── public/
│   └── index.html     ← Homepage with "Buy Test Item" button
├── package.json
├── .env.example       ← Copy to .env and add your Stripe key
└── .gitignore         ← Keeps .env and node_modules out of GitHub
```

---

## How It Works

```
Homepage → "Buy Test Item" button
  → POST /create-checkout-session (Express)
    → Stripe creates a Checkout Session
      → User redirected to Stripe-hosted payment page
        → On success → GET /success (shows confirmation)
        → On cancel  → GET /cancel  (shows cancel message)
```

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Stripe key
```bash
cp .env.example .env
```
Open `.env` and replace `sk_test_REPLACE_WITH_YOUR_KEY` with your **test secret key** from:
👉 https://dashboard.stripe.com/test/apikeys

### 3. Run the app
```bash
npm start
```
Visit: http://localhost:3000

### 4. Test a payment
Use Stripe's test card:
- **Card number:** `4242 4242 4242 4242`
- **Expiry:** any future date (e.g. `12/26`)
- **CVC:** any 3 digits (e.g. `123`)
- **ZIP:** any 5 digits (e.g. `12345`)

---

## Deploying to Render (Free Hosting)

1. Push this project to a **new GitHub repository**
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables in Render dashboard:
   - `STRIPE_SECRET_KEY` → your `sk_test_...` key
   - `BASE_URL` → your Render URL (e.g. `https://your-app.onrender.com`)
6. Click **Deploy**

---

## Grader Verification Checklist

| Step | Expected Result |
|------|----------------|
| Visit homepage | Loads with "Buy Test Item — $1.00" button visible |
| Click the button | Redirects to Stripe-hosted checkout page |
| Enter test card details | Payment form accepts card number `4242 4242 4242 4242` |
| Complete payment | Redirected back to `/success` on this site |
| Success page | Shows item name, **$1.00**, date/time, transaction ID |
| Cancel (go back) | Redirected to `/cancel` page with return link |

---

## Security Notes

- The secret key is stored only in environment variables — never in code
- Card data is handled entirely by Stripe's servers — never touches this app
- `.env` is in `.gitignore` so secrets are never committed to GitHub
