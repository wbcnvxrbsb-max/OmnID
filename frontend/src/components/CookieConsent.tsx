import { useState } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "omnid-cookie-consent";

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(CONSENT_KEY) === "accepted"
  );

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-omn-surface border-t border-omn-border px-4 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-omn-text text-center sm:text-left">
          OmnID uses cookies from Google, Firebase, and Stripe for authentication and payments.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/privacy"
            className="text-sm text-omn-primary hover:text-omn-primary-light transition-colors"
          >
            Learn More
          </Link>
          <button
            onClick={() => {
              localStorage.setItem(CONSENT_KEY, "accepted");
              setDismissed(true);
            }}
            className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
