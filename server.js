// ============================================================
// server.js — CYBR2310 Week 9 Payment App
// Uses Stripe Hosted Checkout (no raw card data on our server)
// ============================================================

require("dotenv").config(); // Load STRIPE_SECRET_KEY from .env

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public (HTML, CSS, JS)
app.use(express.static("public"));

// -------------------------------------------------------
// POST /create-checkout-session
// Creates a Stripe Checkout Session for a $1.00 item and
// returns the hosted checkout URL to redirect the user to.
// -------------------------------------------------------
app.post("/create-checkout-session", async (req, res) => {
  try {
    // Build the absolute base URL so success/cancel redirects work on any host
    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Accept credit/debit cards
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Item — CYBR2310",
              description: "Assignment verification payment ($1.00 test charge)",
            },
            unit_amount: 100, // Amount in cents — 100 cents = $1.00
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment (not subscription)
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    // Send the session URL back so the frontend can redirect
    res.json({ url: session.url });
  } catch (error) {
    // Log the error server-side and return a 500 to the client
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// -------------------------------------------------------
// GET /success
// Shown after successful Stripe payment.
// Retrieves the Stripe session to display confirmation details.
// -------------------------------------------------------
app.get("/success", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    // Fetch the completed session from Stripe so we can display real details
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Format the completion timestamp for display
    const date = new Date(session.created * 1000).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f0fdf4;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .checkmark {
      font-size: 64px;
      margin-bottom: 16px;
    }
    h1 { color: #16a34a; font-size: 1.75rem; margin-bottom: 8px; }
    p { color: #4b5563; margin-bottom: 6px; line-height: 1.5; }
    .detail {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      text-align: left;
    }
    .detail p { display: flex; justify-content: space-between; font-size: 0.95rem; }
    .detail p strong { color: #111827; }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 28px;
      background: #16a34a;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    a:hover { background: #15803d; }
  </style>
</head>
<body>
  <div class="card">
    <div class="checkmark">✅</div>
    <h1>Payment Successful!</h1>
    <p>Thank you — your payment has been processed.</p>
    <div class="detail">
      <p><span>Item:</span> <strong>Test Item — CYBR2310</strong></p>
      <p><span>Amount Charged:</span> <strong>$1.00 USD</strong></p>
      <p><span>Date/Time:</span> <strong>${date}</strong></p>
      <p><span>Transaction ID:</span> <strong>${session.payment_intent || session.id}</strong></p>
      <p><span>Status:</span> <strong style="color:#16a34a">${session.payment_status.toUpperCase()}</strong></p>
    </div>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>
    `);
  } catch (err) {
    // If session retrieval fails, show a generic success message
    console.error("Session retrieval error:", err.message);
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payment Successful</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 60px 24px; background: #f0fdf4; }
    h1 { color: #16a34a; }
    a { color: #16a34a; }
  </style>
</head>
<body>
  <h1>✅ Payment Successful!</h1>
  <p>Your $1.00 test payment was completed successfully.</p>
  <p><a href="/">← Back to Home</a></p>
</body>
</html>
    `);
  }
});

// -------------------------------------------------------
// GET /cancel
// Shown if the user cancels payment on Stripe's hosted page.
// -------------------------------------------------------
app.get("/cancel", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Cancelled</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #fff7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #ea580c; font-size: 1.75rem; margin-bottom: 8px; }
    p { color: #4b5563; margin-bottom: 12px; line-height: 1.5; }
    a {
      display: inline-block;
      margin-top: 8px;
      padding: 12px 28px;
      background: #ea580c;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    a:hover { background: #c2410c; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Payment Cancelled</h1>
    <p>No charge was made. You can try again whenever you're ready.</p>
    <a href="/">← Return to Home</a>
  </div>
</body>
</html>
  `);
});

// -------------------------------------------------------
// Start the server
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
