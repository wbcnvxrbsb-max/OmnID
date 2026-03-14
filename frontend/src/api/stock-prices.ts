/**
 * Finnhub free API for real stock quotes.
 * Set VITE_FINNHUB_API_KEY in .env.local (free at finnhub.io).
 * Falls back to null if no key or rate-limited.
 */

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;

export interface StockQuote {
  price: number;       // current price
  change: number;      // $ change
  changePct: number;   // % change
  high: number;        // day high
  low: number;         // day low
  open: number;
  prevClose: number;
}

const CACHE_KEY = "omnid-stock-prices";
const CACHE_TTL = 60_000; // 1 minute

interface StockCache {
  quotes: Record<string, StockQuote>;
  timestamp: number;
}

function getCache(): StockCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as StockCache;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry;
  } catch {
    return null;
  }
}

export function isStockApiConfigured(): boolean {
  return !!API_KEY;
}

/** Fetch a single stock quote */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.c || d.c === 0) return null;
    return {
      price: d.c,
      change: d.d ?? 0,
      changePct: d.dp ?? 0,
      high: d.h ?? d.c,
      low: d.l ?? d.c,
      open: d.o ?? d.c,
      prevClose: d.pc ?? d.c,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols in parallel batches.
 * Uses cache to avoid redundant calls within TTL.
 */
export async function fetchStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  const cached = getCache();
  if (cached && symbols.every((s) => s in cached.quotes)) {
    return cached.quotes;
  }

  if (!API_KEY) return {};

  const quotes: Record<string, StockQuote> = cached?.quotes ?? {};
  const toFetch = symbols.filter((s) => !(s in quotes));

  // Batch in groups of 10 to respect rate limits (60/min)
  const batchSize = 10;
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (sym) => {
        const q = await fetchStockQuote(sym);
        return { sym, q };
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.q) {
        quotes[r.value.sym] = r.value.q;
      }
    }
    // Small delay between batches to be safe
    if (i + batchSize < toFetch.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify({ quotes, timestamp: Date.now() }));
  return quotes;
}
