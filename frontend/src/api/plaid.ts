/**
 * Plaid Integration — Sandbox Mode
 *
 * Communicates with Netlify Functions that wrap the Plaid Node SDK.
 * Link tokens are created server-side; the frontend uses react-plaid-link
 * to open the Plaid Link modal and exchanges public tokens via the backend.
 * Account data is cached in localStorage for the session.
 */

import { API_BASE } from "./config";

// ── Types ──────────────────────────────────────────────────────────────

export interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  balances: {
    available: number | null;
    current: number | null;
    currency: string;
  };
}

export interface PlaidTransaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
  merchant_name: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "omnid-bank-accounts";

// ── API calls ──────────────────────────────────────────────────────────

/** Request a Plaid Link token from the backend */
export async function getLinkToken(userId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/plaid/link-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_user_id: userId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  const data: { link_token: string } = await res.json();
  return data.link_token;
}

/** Exchange a Plaid public token for account + transaction data */
export async function exchangePublicToken(
  publicToken: string
): Promise<{ accounts: PlaidAccount[]; transactions: PlaidTransaction[] }> {
  const res = await fetch(`${API_BASE}/api/plaid/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_token: publicToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  const data: { accounts: PlaidAccount[]; transactions: PlaidTransaction[] } =
    await res.json();

  // Persist accounts in localStorage
  const existing = getBankAccounts();
  const newIds = new Set(data.accounts.map((a) => a.account_id));
  const merged = [
    ...existing.filter((a) => !newIds.has(a.account_id)),
    ...data.accounts,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  return data;
}

// ── localStorage helpers ───────────────────────────────────────────────

/** Read cached bank accounts from localStorage */
export function getBankAccounts(): PlaidAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Clear all cached bank accounts */
export function clearBankAccounts(): void {
  localStorage.removeItem(STORAGE_KEY);
}
