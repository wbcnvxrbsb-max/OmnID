import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const PRICES: Record<string, number> = {
  monthly: 999,  // $9.99
  yearly: 9900,  // $99.00
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { plan, userEmail } = await req.json();
    const amount = PRICES[plan];
    if (!amount) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://omnid.netlify.app";

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

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/create-checkout",
};
