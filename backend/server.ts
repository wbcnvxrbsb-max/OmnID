import express from "express";
import cors from "cors";
import stripeRoutes from "./routes/stripe.js";
import oauthRoutes from "./routes/oauth.js";
import plaidRoutes from "./routes/plaid.js";
import faucetRoutes from "./routes/faucet.js";
import identityRoutes from "./routes/identity.js";
import reputationRoutes from "./routes/reputation.js";
import partnerRoutes from "./routes/partner.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// CORS — restrict to known origins
const ALLOWED_ORIGINS = [
  "https://omnid.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

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
app.use(identityRoutes);
app.use(reputationRoutes);
app.use(partnerRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
