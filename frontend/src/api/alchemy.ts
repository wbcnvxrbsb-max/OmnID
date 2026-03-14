/**
 * Alchemy RPC integration — provides premium RPC URLs for supported chains.
 * Set VITE_ALCHEMY_API_KEY in .env to enable.
 * Falls back gracefully: if not configured, consumers use default public RPCs.
 */

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined;

/** Chain ID → Alchemy RPC base URL (without the API key suffix) */
const ALCHEMY_CHAIN_URLS: Record<number, string> = {
  1:     "https://eth-mainnet.g.alchemy.com/v2",
  137:   "https://polygon-mainnet.g.alchemy.com/v2",
  42161: "https://arb-mainnet.g.alchemy.com/v2",
  10:    "https://opt-mainnet.g.alchemy.com/v2",
  8453:  "https://base-mainnet.g.alchemy.com/v2",
};

/** Full Alchemy RPC URLs keyed by chain ID (only populated when API key is set) */
export const alchemyUrls: Record<number, string> = {};

if (ALCHEMY_API_KEY) {
  for (const [chainId, baseUrl] of Object.entries(ALCHEMY_CHAIN_URLS)) {
    alchemyUrls[Number(chainId)] = `${baseUrl}/${ALCHEMY_API_KEY}`;
  }
}

/**
 * Returns the Alchemy RPC URL for the given chain ID,
 * or null if Alchemy is not configured or the chain is unsupported.
 */
export function getAlchemyUrl(chainId: number): string | null {
  if (!ALCHEMY_API_KEY) return null;
  const baseUrl = ALCHEMY_CHAIN_URLS[chainId];
  if (!baseUrl) return null;
  return `${baseUrl}/${ALCHEMY_API_KEY}`;
}

/** Returns true if VITE_ALCHEMY_API_KEY is set in the environment. */
export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY;
}
