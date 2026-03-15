import { useState, useEffect } from "react";
import { getGoogleUser } from "../google-auth";
import { API_BASE } from "../api/config";

const features = [
  {
    title: "Constant Reputation Sync",
    description: "Your ratings update in real-time across all connected platforms. No manual syncing needed.",
  },
  {
    title: "Verified Professional Badge",
    description: "Stand out with a verified OmnID Pro badge on every platform. Companies trust verified workers more.",
  },
  {
    title: "Priority Platform Transfers",
    description: "Transfer your reputation to new platforms instantly, with priority processing.",
  },
  {
    title: "Advanced Analytics",
    description: "See detailed performance trends, review sentiment analysis, and income projections.",
  },
  {
    title: "Multi-Platform Auto-Sync",
    description: "Automatically sync your profile across all gig platforms. Change your photo once, update everywhere.",
  },
  {
    title: "Priority Support",
    description: "Get help from OmnID support within 1 hour. Free users wait up to 48 hours.",
  },
];

const PRO_KEY = "omnid-pro-subscribed";
const PRO_SESSION_KEY = "omnid-pro-session-id";

export default function Pro() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [subscribed, setSubscribed] = useState(() => localStorage.getItem(PRO_KEY) === "true");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleUser = getGoogleUser();

  // On mount, check for session_id in URL (returning from Stripe Checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId && !subscribed) {
      verifySession(sessionId);
      // Clean URL
      window.history.replaceState({}, "", "/pro");
    }
  }, []);

  async function verifySession(sessionId: string) {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.paid) {
        localStorage.setItem(PRO_KEY, "true");
        localStorage.setItem(PRO_SESSION_KEY, sessionId);
        setSubscribed(true);
      } else {
        setError("Payment not confirmed. Please try again or contact support.");
      }
    } catch {
      setError("Could not verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          userEmail: googleUser?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not create checkout session.");
        setLoading(false);
      }
    } catch {
      setError("Could not connect to payment server. Please try again.");
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-omn-pro/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl text-omn-pro">{"\u2605"}</span>
        </div>
        <h1 className="text-2xl font-bold text-omn-heading mb-2">Verifying payment...</h1>
        <p className="text-sm text-omn-text">Confirming your subscription with Stripe.</p>
      </div>
    );
  }

  if (subscribed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-omn-pro/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-omn-pro">{"\u2605"}</span>
        </div>
        <h1 className="text-3xl font-bold text-omn-heading mb-2">
          Welcome to OmnID Pro!
        </h1>
        <p className="text-omn-text mb-6">
          Your verified professional badge is now active. Enjoy constant sync, priority transfers, and more.
        </p>

        {/* Badge Preview */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-omn-pro/20 border border-omn-pro/30 rounded-full mb-8">
          <span className="text-omn-pro">{"\u2605"}</span>
          <span className="text-sm font-medium text-omn-pro">OmnID Pro Verified</span>
          <span className="text-omn-pro">{"\u2713"}</span>
        </div>

        <div className="flex gap-3 justify-center">
          <a href="/" className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors">
            Go to Dashboard
          </a>
          <a href="/reputation" className="px-6 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">
            View Reputation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-omn-pro/20 border border-omn-pro/30 rounded-full mb-4">
            <span className="text-omn-pro">{"\u2605"}</span>
            <span className="text-sm font-medium text-omn-pro">OmnID Pro</span>
          </div>
          <h1 className="text-4xl font-bold text-omn-heading mb-3">
            Level Up Your Gig Career
          </h1>
          <p className="text-lg text-omn-text max-w-xl mx-auto">
            For professional gig workers who want constant sync, a verified badge, and priority access across all platforms.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedPlan === "monthly"
                ? "bg-omn-pro text-white"
                : "bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading"
            }`}
          >
            $9.99 / month
          </button>
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedPlan === "yearly"
                ? "bg-omn-pro text-white"
                : "bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading"
            }`}
          >
            $99 / year
            <span className="ml-2 text-xs text-omn-success">Save 17%</span>
          </button>
        </div>

        {/* Features */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-3 p-3 bg-omn-bg rounded-lg">
                <div className="w-6 h-6 bg-omn-pro/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-omn-pro">{"\u2713"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-omn-heading">{feature.title}</p>
                  <p className="text-xs text-omn-text mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Preview */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">
            Verified Badge Preview
          </h2>
          <p className="text-sm text-omn-text mb-4">
            This badge appears on your profile across all connected platforms:
          </p>
          <div className="flex items-center gap-4 p-4 bg-omn-bg rounded-lg">
            <div className="w-12 h-12 bg-omn-pro/20 rounded-full flex items-center justify-center">
              <span className="text-xl text-omn-pro">{"\u2605"}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-omn-heading">
                  {googleUser?.name ?? "Henry Thompson"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-omn-pro/20 border border-omn-pro/30 rounded-full">
                  <span className="text-[10px] text-omn-pro">{"\u2605"}</span>
                  <span className="text-[10px] font-medium text-omn-pro">Pro Verified</span>
                </span>
              </div>
              <p className="text-xs text-omn-text">4.9 stars · 5,678 jobs · 98% on-time</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-omn-danger">{error}</p>
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-omn-pro to-omn-accent text-white rounded-xl font-medium text-lg transition-all duration-200 hover:shadow-lg hover:shadow-omn-pro/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting to Stripe..." : `Subscribe to OmnID Pro — ${selectedPlan === "monthly" ? "$9.99/mo" : "$99/yr"}`}
          </button>
          <p className="text-xs text-omn-text mt-3">
            Secure checkout powered by Stripe. Cancel anytime.
          </p>
        </div>

        {/* Revenue Note */}
        <div className="mt-12 bg-omn-accent/10 border border-omn-accent/30 rounded-xl p-4 text-center">
          <p className="text-xs text-omn-text">
            <span className="text-omn-accent font-medium">Revenue Stream:</span>{" "}
            Pro subscriptions generate $9.99/mo or $99/yr per professional gig worker.
            With 10,000 Pro users: ~$100K/month recurring revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
