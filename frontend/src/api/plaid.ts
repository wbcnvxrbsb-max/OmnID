/**
 * Plaid Sandbox Simulation
 *
 * Simulates the Plaid Link flow for bank account linking.
 * In production, Plaid Link requires a backend to create link tokens and exchange
 * public tokens for access tokens. This sandbox version stores mock bank account
 * data in localStorage to demonstrate the UX flow.
 */

export interface PlaidAccount {
  institution: string;
  institutionId: string;
  accountName: string;
  accountType: "checking" | "savings" | "credit";
  mask: string;
  balance: number;
  currency: string;
  logo: string;
  color: string;
}

export interface Institution {
  name: string;
  id: string;
  logo: string;
  color: string;
  accounts: Omit<PlaidAccount, "institution" | "institutionId" | "logo" | "color">[];
}

const STORAGE_KEY = "omnid-plaid-accounts";

export const AVAILABLE_INSTITUTIONS: Institution[] = [
  {
    name: "Chase",
    id: "ins_chase",
    logo: "C",
    color: "bg-blue-700",
    accounts: [
      { accountName: "Chase Total Checking", accountType: "checking", mask: "4829", balance: 3245.67, currency: "USD" },
      { accountName: "Chase Savings", accountType: "savings", mask: "7712", balance: 12480.33, currency: "USD" },
      { accountName: "Chase Freedom Unlimited", accountType: "credit", mask: "9901", balance: 1523.44, currency: "USD" },
    ],
  },
  {
    name: "Bank of America",
    id: "ins_bofa",
    logo: "B",
    color: "bg-red-700",
    accounts: [
      { accountName: "Advantage Checking", accountType: "checking", mask: "3351", balance: 5892.10, currency: "USD" },
      { accountName: "Advantage Savings", accountType: "savings", mask: "6604", balance: 27150.00, currency: "USD" },
    ],
  },
  {
    name: "Wells Fargo",
    id: "ins_wells",
    logo: "W",
    color: "bg-yellow-700",
    accounts: [
      { accountName: "Everyday Checking", accountType: "checking", mask: "2087", balance: 1876.42, currency: "USD" },
      { accountName: "Way2Save Savings", accountType: "savings", mask: "5543", balance: 8320.55, currency: "USD" },
      { accountName: "Active Cash Card", accountType: "credit", mask: "1190", balance: 742.18, currency: "USD" },
    ],
  },
  {
    name: "Capital One",
    id: "ins_capitalone",
    logo: "C1",
    color: "bg-red-600",
    accounts: [
      { accountName: "360 Checking", accountType: "checking", mask: "8814", balance: 4102.89, currency: "USD" },
      { accountName: "360 Performance Savings", accountType: "savings", mask: "4420", balance: 15600.00, currency: "USD" },
    ],
  },
  {
    name: "Citi",
    id: "ins_citi",
    logo: "Ci",
    color: "bg-blue-600",
    accounts: [
      { accountName: "Citi Priority Checking", accountType: "checking", mask: "6637", balance: 7431.25, currency: "USD" },
      { accountName: "Citi Accelerate Savings", accountType: "savings", mask: "3398", balance: 21800.50, currency: "USD" },
      { accountName: "Citi Double Cash Card", accountType: "credit", mask: "5521", balance: 2156.90, currency: "USD" },
    ],
  },
];

/** Read linked banks from localStorage */
export function getLinkedBanks(): PlaidAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save linked banks to localStorage */
function saveLinkedBanks(accounts: PlaidAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Storage full or unavailable
  }
}

/** Simulate linking a bank — adds the institution's accounts and persists */
export function linkBank(institutionId: string): PlaidAccount[] {
  const institution = AVAILABLE_INSTITUTIONS.find((i) => i.id === institutionId);
  if (!institution) return getLinkedBanks();

  const existing = getLinkedBanks();

  // Don't re-link if already linked
  if (existing.some((a) => a.institutionId === institutionId)) return existing;

  const newAccounts: PlaidAccount[] = institution.accounts.map((acc) => ({
    ...acc,
    institution: institution.name,
    institutionId: institution.id,
    logo: institution.logo,
    color: institution.color,
  }));

  const updated = [...existing, ...newAccounts];
  saveLinkedBanks(updated);
  return updated;
}

/** Remove all accounts for an institution */
export function unlinkBank(institutionId: string): PlaidAccount[] {
  const existing = getLinkedBanks();
  const updated = existing.filter((a) => a.institutionId !== institutionId);
  saveLinkedBanks(updated);
  return updated;
}

/** Get unique linked institution IDs */
export function getLinkedInstitutionIds(): string[] {
  const accounts = getLinkedBanks();
  return [...new Set(accounts.map((a) => a.institutionId))];
}
