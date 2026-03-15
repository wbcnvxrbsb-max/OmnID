import { Router } from "express";
import type { Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
});

const PRICES: Record<string, number> = {
  monthly: 999,  // $9.99
  yearly: 9900,  // $99.00
};

// POST /api/create-checkout
router.post("/api/create-checkout", async (req: Request, res: Response) => {
  try {
    const { plan, userEmail } = req.body;
    const amount = PRICES[plan];
    if (!amount) {
      res.status(400).json({ error: "Invalid plan" });
      return;
    }

    const origin = req.headers.origin || "https://omnid.netlify.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `OmnID Pro (${plan})`,
              description: plan === "monthly"
                ? "Monthly Pro subscription — verified badge, real-time sync, priority support"
                : "Yearly Pro subscription — save 17% — verified badge, real-time sync, priority support",
            },
            unit_amount: amount,
            ...(plan === "monthly"
              ? { recurring: { interval: "month" } }
              : { recurring: { interval: "year" } }),
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: userEmail || undefined,
      success_url: `${origin}/pro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/verify-session
router.post("/api/verify-session", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "Missing session ID" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === "paid";
    res.json({
      paid,
      customerEmail: session.customer_email,
      plan: session.metadata?.plan,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe-webhook
// Note: This route uses express.raw() middleware mounted in server.ts
router.post("/api/stripe-webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    res.status(400).json({ error: "Missing signature" });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          `Pro subscription activated: ${session.customer_email}, amount: ${session.amount_total}, plan: ${session.metadata?.plan}`
        );
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Pro subscription cancelled: ${subscription.id}`);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
