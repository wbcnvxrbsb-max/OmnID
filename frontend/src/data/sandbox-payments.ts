/**
 * Sandbox Payment Methods Database for OmnID Demo
 *
 * FAKE payment methods for demo/testing purposes only.
 * Simulates Apple Pay, Google Wallet, credit cards, and crypto holdings.
 */

export interface PaymentMethod {
  id: string;
  type: "apple_pay" | "google_wallet" | "credit_card" | "crypto";
  label: string;
  last4?: string;
  balance?: number;          // USD balance for wallets and cards
  cryptoBalance?: number;
  cryptoSymbol?: string;
  icon: string;
  color: string;
}

export const paymentTypeInfo: Record<string, { name: string; icon: string; color: string }> = {
  apple_pay: { name: "Apple Pay", icon: "AP", color: "bg-gray-900" },
  google_wallet: { name: "Google Wallet", icon: "GW", color: "bg-blue-600" },
  credit_card: { name: "Credit Card", icon: "CC", color: "bg-slate-600" },
  crypto: { name: "Crypto", icon: "BT", color: "bg-amber-600" },
};

// Payment methods keyed by SSN
export const sandboxPaymentMethods: Record<string, PaymentMethod[]> = {
  "123-45-6789": [
    { id: "pm-1", type: "apple_pay", label: "Alice's iPhone", balance: 1342.18, icon: "AP", color: "bg-gray-900" },
    { id: "pm-2", type: "google_wallet", label: "alice.johnson@gmail.com", balance: 856.40, icon: "GW", color: "bg-blue-600" },
    { id: "pm-3", type: "crypto", label: "USDC Balance", cryptoBalance: 245.50, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
  ],
  "234-56-7890": [
    { id: "pm-4", type: "apple_pay", label: "Bob's iPhone", balance: 2105.73, icon: "AP", color: "bg-gray-900" },
    { id: "pm-5", type: "credit_card", label: "Visa ending in 4242", last4: "4242", balance: 7500.00, icon: "CC", color: "bg-slate-600" },
    { id: "pm-6", type: "crypto", label: "USDC Balance", cryptoBalance: 1230.00, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
    { id: "pm-7", type: "crypto", label: "ETH Balance", cryptoBalance: 0.85, cryptoSymbol: "ETH", icon: "ET", color: "bg-indigo-600" },
  ],
  "345-67-8901": [
    { id: "pm-8", type: "google_wallet", label: "carol.martinez@gmail.com", balance: 423.90, icon: "GW", color: "bg-blue-600" },
    { id: "pm-9", type: "crypto", label: "USDC Balance", cryptoBalance: 89.25, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
  ],
  "456-78-9012": [
    { id: "pm-10", type: "apple_pay", label: "David's iPhone", balance: 3891.55, icon: "AP", color: "bg-gray-900" },
    { id: "pm-11", type: "google_wallet", label: "david.kim@gmail.com", balance: 1204.62, icon: "GW", color: "bg-blue-600" },
    { id: "pm-12", type: "credit_card", label: "Mastercard ending in 8888", last4: "8888", balance: 15000.00, icon: "CC", color: "bg-slate-600" },
    { id: "pm-13", type: "crypto", label: "USDC Balance", cryptoBalance: 5420.00, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
    { id: "pm-14", type: "crypto", label: "ETH Balance", cryptoBalance: 2.15, cryptoSymbol: "ETH", icon: "ET", color: "bg-indigo-600" },
  ],
  "567-89-0123": [
    { id: "pm-15", type: "apple_pay", label: "Emma's iPad", balance: 287.33, icon: "AP", color: "bg-gray-900" },
    { id: "pm-16", type: "crypto", label: "USDC Balance", cryptoBalance: 15.00, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
  ],
  "678-90-1234": [
    { id: "pm-17", type: "apple_pay", label: "Frank's iPhone", balance: 5620.00, icon: "AP", color: "bg-gray-900" },
    { id: "pm-18", type: "google_wallet", label: "frank.patel@gmail.com", balance: 2340.88, icon: "GW", color: "bg-blue-600" },
    { id: "pm-19", type: "credit_card", label: "Amex ending in 1001", last4: "1001", balance: 25000.00, icon: "CC", color: "bg-slate-600" },
    { id: "pm-20", type: "crypto", label: "USDC Balance", cryptoBalance: 12850.00, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
    { id: "pm-21", type: "crypto", label: "ETH Balance", cryptoBalance: 8.32, cryptoSymbol: "ETH", icon: "ET", color: "bg-indigo-600" },
  ],
  "789-01-2345": [
    { id: "pm-22", type: "google_wallet", label: "grace.lee@gmail.com", balance: 612.45, icon: "GW", color: "bg-blue-600" },
    { id: "pm-23", type: "crypto", label: "USDC Balance", cryptoBalance: 42.75, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
  ],
  "890-12-3456": [
    { id: "pm-24", type: "apple_pay", label: "Henry's iPhone", balance: 4217.60, icon: "AP", color: "bg-gray-900" },
    { id: "pm-25", type: "google_wallet", label: "henry.thompson@gmail.com", balance: 1893.25, icon: "GW", color: "bg-blue-600" },
    { id: "pm-26", type: "credit_card", label: "Visa ending in 9999", last4: "9999", balance: 10000.00, icon: "CC", color: "bg-slate-600" },
    { id: "pm-27", type: "credit_card", label: "Mastercard ending in 5555", last4: "5555", balance: 5000.00, icon: "CC", color: "bg-slate-600" },
    { id: "pm-28", type: "crypto", label: "USDC Balance", cryptoBalance: 28500.00, cryptoSymbol: "USDC", icon: "US", color: "bg-blue-500" },
    { id: "pm-29", type: "crypto", label: "ETH Balance", cryptoBalance: 15.67, cryptoSymbol: "ETH", icon: "ET", color: "bg-indigo-600" },
  ],
};

/**
 * Get payment methods for a person by SSN
 */
export function getPaymentMethods(ssn: string): PaymentMethod[] {
  return sandboxPaymentMethods[ssn] ?? [];
}
