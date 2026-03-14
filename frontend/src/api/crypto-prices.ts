/**
 * CoinGecko free API — no key needed.
 * Fetches USD prices + 24h change for native chain tokens.
 */

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  MATIC: "matic-network",
  POL: "matic-network",
  AVAX: "avalanche-2",
  BNB: "binancecoin",
  // For ERC-20 tokens
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
};

export interface CryptoPrice {
  usd: number;
  change24h: number;
}

const CACHE_KEY = "omnid-crypto-prices";
const CACHE_TTL = 60_000; // 1 minute

interface CacheEntry {
  prices: Record<string, CryptoPrice>;
  timestamp: number;
}

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry;
  } catch {
    return null;
  }
}

export async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, CryptoPrice>> {
  const cached = getCache();
  if (cached) return cached.prices;

  const ids = [...new Set(symbols.map((s) => COINGECKO_IDS[s]).filter(Boolean))];
  if (ids.length === 0) return {};

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!res.ok) return {};
    const data = await res.json();

    const prices: Record<string, CryptoPrice> = {};
    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      if (data[geckoId]) {
        prices[symbol] = {
          usd: data[geckoId].usd ?? 0,
          change24h: data[geckoId].usd_24h_change ?? 0,
        };
      }
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ prices, timestamp: Date.now() }));
    return prices;
  } catch {
    return {};
  }
}

/** Map chain ID to native token symbol for price lookup */
export const CHAIN_NATIVE_SYMBOL: Record<number, string> = {
  1: "ETH",
  137: "POL",
  42161: "ETH",
  10: "ETH",
  43114: "AVAX",
  56: "BNB",
  8453: "ETH",
};
