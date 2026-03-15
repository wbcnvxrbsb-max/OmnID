import express from "express";
import cors from "cors";
import stripeRoutes from "./routes/stripe.js";
import oauthRoutes from "./routes/oauth.js";
import plaidRoutes from "./routes/plaid.js";
import faucetRoutes from "./routes/faucet.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow all origins for now
app.use(cors());

// The Stripe webhook route needs the raw body for signature verification,
// so we mount it BEFORE the global express.json() middleware.
app.use("/api/stripe-webhook", express.raw({ type: "application/json" }));

// JSON body parser for all other routes
app.use(express.json());

// Mount route handlers
app.use(stripeRoutes);
app.use(oauthRoutes);
app.use(plaidRoutes);
app.use(faucetRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
