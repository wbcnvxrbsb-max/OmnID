/**
 * Shared funding utilities — reads connected payment methods from localStorage
 * so any page can offer "pay with Apple Pay / Google Wallet / card / crypto".
 */

import type { PaymentMethod } from "./data/sandbox-payments";

const PAY_METHODS_KEY = "omnid-pay-methods";

/** Get all connected payment methods (persisted by Payments page) */
export function getConnectedPaymentMethods(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(PAY_METHODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Friendly label for a payment method */
export function fundingLabel(pm: PaymentMethod): string {
  if (pm.type === "apple_pay") return "Apple Pay";
  if (pm.type === "google_wallet") return "Google Wallet";
  if (pm.type === "crypto") return pm.cryptoSymbol ?? "Crypto";
  return pm.label;
}
