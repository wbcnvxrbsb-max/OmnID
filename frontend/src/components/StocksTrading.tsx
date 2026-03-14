import { useState, useEffect, useMemo } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import { pushActivity } from "../activity";
import { fetchStockQuotes, isStockApiConfigured, type StockQuote } from "../api/stock-prices";
import { getConnectedPaymentMethods, fundingLabel } from "../funding";
import type { PaymentMethod } from "../data/sandbox-payments";

// ─── Market Data ───
const marketData: Record<string, { name: string; price: number; change: number; volume: string; marketCap: string; pe: number; sector: string; week52High: number; week52Low: number }> = {
  AAPL: { name: "Apple Inc.", price: 227.48, change: +0.9, volume: "52.3M", marketCap: "$3.48T", pe: 28.4, sector: "Technology", week52High: 237.23, week52Low: 164.08 },
  MSFT: { name: "Microsoft Corp.", price: 415.20, change: +1.2, volume: "28.1M", marketCap: "$3.09T", pe: 35.2, sector: "Technology", week52High: 430.82, week52Low: 309.45 },
  GOOGL: { name: "Alphabet Inc.", price: 175.32, change: -0.4, volume: "31.5M", marketCap: "$2.16T", pe: 25.8, sector: "Technology", week52High: 191.75, week52Low: 130.67 },
  AMZN: { name: "Amazon.com Inc.", price: 195.87, change: +2.1, volume: "45.2M", marketCap: "$2.04T", pe: 58.3, sector: "Technology", week52High: 201.20, week52Low: 151.61 },
  NVDA: { name: "NVIDIA Corp.", price: 875.42, change: +3.5, volume: "38.7M", marketCap: "$2.15T", pe: 62.1, sector: "Technology", week52High: 974.00, week52Low: 473.20 },
  META: { name: "Meta Platforms", price: 512.90, change: +1.8, volume: "18.4M", marketCap: "$1.30T", pe: 27.6, sector: "Technology", week52High: 542.81, week52Low: 390.42 },
  TSLA: { name: "Tesla Inc.", price: 248.65, change: -2.3, volume: "67.8M", marketCap: "$791B", pe: 72.4, sector: "Automotive", week52High: 358.64, week52Low: 138.80 },
  JPM: { name: "JPMorgan Chase", price: 198.40, change: +0.5, volume: "12.1M", marketCap: "$571B", pe: 11.2, sector: "Finance", week52High: 205.88, week52Low: 165.50 },
  V: { name: "Visa Inc.", price: 285.12, change: +0.7, volume: "8.5M", marketCap: "$583B", pe: 30.5, sector: "Finance", week52High: 290.96, week52Low: 252.70 },
  JNJ: { name: "Johnson & Johnson", price: 162.35, change: -0.2, volume: "7.2M", marketCap: "$391B", pe: 14.8, sector: "Healthcare", week52High: 168.85, week52Low: 143.13 },
  WMT: { name: "Walmart Inc.", price: 68.90, change: +0.3, volume: "15.3M", marketCap: "$554B", pe: 30.1, sector: "Retail", week52High: 73.14, week52Low: 49.85 },
  DIS: { name: "Walt Disney Co.", price: 112.45, change: +1.1, volume: "11.6M", marketCap: "$206B", pe: 42.3, sector: "Entertainment", week52High: 123.74, week52Low: 83.91 },
  NFLX: { name: "Netflix Inc.", price: 892.30, change: +2.8, volume: "5.1M", marketCap: "$384B", pe: 48.7, sector: "Entertainment", week52High: 941.75, week52Low: 543.22 },
  AMD: { name: "AMD", price: 165.20, change: +4.1, volume: "42.3M", marketCap: "$267B", pe: 46.8, sector: "Technology", week52High: 227.30, week52Low: 120.83 },
  CRM: { name: "Salesforce Inc.", price: 295.80, change: -0.8, volume: "6.4M", marketCap: "$285B", pe: 45.2, sector: "Technology", week52High: 318.71, week52Low: 212.00 },
  COIN: { name: "Coinbase Global", price: 245.10, change: +5.2, volume: "14.2M", marketCap: "$61B", pe: 38.9, sector: "Finance", week52High: 283.48, week52Low: 114.51 },
  SQ: { name: "Block Inc.", price: 78.45, change: +1.6, volume: "9.8M", marketCap: "$47B", pe: 52.1, sector: "Finance", week52High: 87.52, week52Low: 55.52 },
  UBER: { name: "Uber Technologies", price: 72.30, change: +0.4, volume: "16.7M", marketCap: "$150B", pe: 75.3, sector: "Transportation", week52High: 82.14, week52Low: 54.84 },
  ABNB: { name: "Airbnb Inc.", price: 158.20, change: -1.1, volume: "5.3M", marketCap: "$100B", pe: 39.4, sector: "Travel", week52High: 170.10, week52Low: 113.01 },
  SPY: { name: "S&P 500 ETF", price: 525.40, change: +0.6, volume: "72.1M", marketCap: "$515B", pe: 22.1, sector: "ETF", week52High: 540.72, week52Low: 450.18 },
  QQQ: { name: "Nasdaq-100 ETF", price: 446.80, change: +0.9, volume: "48.3M", marketCap: "$261B", pe: 30.5, sector: "ETF", week52High: 470.35, week52Low: 355.10 },
  IWM: { name: "Russell 2000 ETF", price: 205.30, change: -0.3, volume: "25.8M", marketCap: "$68B", pe: 18.2, sector: "ETF", week52High: 235.41, week52Low: 188.90 },
  GLD: { name: "SPDR Gold Shares", price: 214.50, change: +0.4, volume: "8.1M", marketCap: "$63B", pe: 0, sector: "Commodity", week52High: 220.85, week52Low: 183.19 },
  TLT: { name: "20+ Year Treasury Bond ETF", price: 92.15, change: -0.5, volume: "22.4M", marketCap: "$50B", pe: 0, sector: "Bond", week52High: 101.57, week52Low: 82.42 },
};

const allSymbols = Object.keys(marketData);
const optionableSymbols = allSymbols.filter((s) => !["GLD", "TLT"].includes(s));

// ─── Types ───
interface Holding { symbol: string; shares: number; avgCost: number }
interface OptionHolding { symbol: string; type: "call" | "put"; strike: number; expiry: string; contracts: number; avgCost: number }
interface Order { id: number; date: string; action: "buy" | "sell"; symbol: string; description: string; quantity: number; price: number; orderType: string; status: "filled" | "pending" | "cancelled"; filledPrice?: number }

interface OptionRow {
  strike: number;
  callBid: number; callAsk: number; callLast: number; callVol: number; callOI: number;
  callDelta: number; callGamma: number; callTheta: number; callVega: number; callIV: number;
  putBid: number; putAsk: number; putLast: number; putVol: number; putOI: number;
  putDelta: number; putGamma: number; putTheta: number; putVega: number; putIV: number;
}

interface StrategyLeg {
  type: "call" | "put";
  action: "buy" | "sell";
  strike: number;
  price: number;
}

type SubTab = "positions" | "trade" | "options" | "strategies" | "orders";
type OrderType = "market" | "limit" | "stop" | "stop_limit" | "trailing_stop";
type TimeInForce = "day" | "gtc" | "ext";
type StrategyMode = "vertical" | "straddle" | "strangle" | "iron_condor" | "butterfly" | "covered_call";

// ─── Defaults ───
const defaultHoldings: Holding[] = [];
const defaultOptionsHoldings: OptionHolding[] = [];
const defaultOrders: Order[] = [];

// ─── Black-Scholes Math ───
const RISK_FREE = 0.05;

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1 + sign * y);
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getBaseIV(symbol: string): number {
  const highVol = ["TSLA", "NVDA", "AMD", "COIN"];
  const medVol = ["META", "AMZN", "NFLX", "CRM", "UBER", "ABNB", "SQ"];
  if (highVol.includes(symbol)) return 0.48;
  if (medVol.includes(symbol)) return 0.36;
  return 0.26;
}

function bsGreeks(S: number, K: number, T: number, sigma: number, type: "call" | "put") {
  if (T <= 0) T = 0.001;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (RISK_FREE + sigma * sigma / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const pd1 = normalPDF(d1);
  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);

  const delta = type === "call" ? nd1 : nd1 - 1;
  const gamma = pd1 / (S * sigma * sqrtT);
  const callTheta = (-(S * pd1 * sigma) / (2 * sqrtT) - RISK_FREE * K * Math.exp(-RISK_FREE * T) * nd2) / 365;
  const putTheta = (-(S * pd1 * sigma) / (2 * sqrtT) + RISK_FREE * K * Math.exp(-RISK_FREE * T) * normalCDF(-d2)) / 365;
  const theta = type === "call" ? callTheta : putTheta;
  const vega = S * pd1 * sqrtT / 100;

  const callPrice = S * nd1 - K * Math.exp(-RISK_FREE * T) * nd2;
  const putPrice = K * Math.exp(-RISK_FREE * T) * normalCDF(-d2) - S * normalCDF(-d1);
  const price = type === "call" ? callPrice : putPrice;

  return {
    price: Math.max(0.01, price),
    delta: +delta.toFixed(4),
    gamma: +gamma.toFixed(4),
    theta: +theta.toFixed(4),
    vega: +vega.toFixed(4),
  };
}

// ─── Options Chain Generator (Black-Scholes based) ───
const expirations = ["2026-03-20", "2026-03-27", "2026-04-03", "2026-04-17", "2026-05-15", "2026-06-19", "2026-09-18", "2027-01-15"];

function generateChain(symbol: string, price: number, expiry: string): OptionRow[] {
  const T = Math.max(0.001, (new Date(expiry).getTime() - Date.now()) / (365.25 * 86400000));
  const baseIV = getBaseIV(symbol);
  const step = price > 500 ? 10 : price > 100 ? 5 : price > 50 ? 2.5 : 1;
  const base = Math.round(price / step) * step;
  const rows: OptionRow[] = [];
  const seed0 = symbol.charCodeAt(0) * 137 + new Date(expiry).getTime() / 86400000;

  for (let i = -6; i <= 6; i++) {
    const strike = +(base + i * step).toFixed(2);
    if (strike <= 0) continue;
    const moneyness = Math.abs(price - strike) / price;
    const skew = moneyness * 0.15 + (strike < price ? moneyness * 0.08 : 0);
    const iv = baseIV + skew;

    const call = bsGreeks(price, strike, T, iv, "call");
    const put = bsGreeks(price, strike, T, iv, "put");

    const seed = seed0 + strike;
    const cVol = Math.floor(pseudoRandom(seed) * 5000 + 100);
    const cOI = Math.floor(pseudoRandom(seed + 1) * 20000 + 500);
    const pVol = Math.floor(pseudoRandom(seed + 2) * 4000 + 80);
    const pOI = Math.floor(pseudoRandom(seed + 3) * 15000 + 300);
    const spread = Math.max(0.01, call.price * 0.02);
    const pSpread = Math.max(0.01, put.price * 0.02);

    rows.push({
      strike,
      callBid: +Math.max(0.01, call.price - spread).toFixed(2),
      callAsk: +(call.price + spread).toFixed(2),
      callLast: +call.price.toFixed(2),
      callVol: cVol, callOI: cOI,
      callDelta: call.delta, callGamma: call.gamma, callTheta: call.theta, callVega: call.vega,
      callIV: +(iv * 100).toFixed(1),
      putBid: +Math.max(0.01, put.price - pSpread).toFixed(2),
      putAsk: +(put.price + pSpread).toFixed(2),
      putLast: +put.price.toFixed(2),
      putVol: pVol, putOI: pOI,
      putDelta: put.delta, putGamma: put.gamma, putTheta: put.theta, putVega: put.vega,
      putIV: +(iv * 100).toFixed(1),
    });
  }
  return rows;
}

// ─── Strategy Helpers ───
const STRATEGY_INFO: Record<StrategyMode, { name: string; legs: number; description: string }> = {
  vertical: { name: "Vertical Spread", legs: 2, description: "Buy one strike, sell another. Defined risk." },
  straddle: { name: "Straddle", legs: 2, description: "Buy call + put at same strike. Profit from big moves." },
  strangle: { name: "Strangle", legs: 2, description: "Buy OTM call + OTM put. Cheaper than straddle." },
  iron_condor: { name: "Iron Condor", legs: 4, description: "Sell call spread + put spread. Profit from low volatility." },
  butterfly: { name: "Butterfly", legs: 3, description: "Buy lower, sell 2x middle, buy upper. Profit if price stays near middle." },
  covered_call: { name: "Covered Call", legs: 1, description: "Sell call against 100 shares you own. Generate income." },
};

function autoFillLegs(mode: StrategyMode, chain: OptionRow[], price: number, direction: "bull" | "bear", legType: "call" | "put"): StrategyLeg[] {
  const strikes = chain.map((r) => r.strike);
  const atmIdx = strikes.findIndex((s) => s >= price);
  const atm = strikes[atmIdx] ?? strikes[0];
  const getRow = (s: number) => chain.find((r) => r.strike === s);

  switch (mode) {
    case "vertical": {
      const s1 = strikes[Math.max(0, atmIdx - 1)] ?? atm;
      const s2 = strikes[Math.min(strikes.length - 1, atmIdx + 1)] ?? atm;
      if (direction === "bull" && legType === "call") {
        return [
          { type: "call", action: "buy", strike: s1, price: getRow(s1)?.callAsk ?? 0 },
          { type: "call", action: "sell", strike: s2, price: getRow(s2)?.callBid ?? 0 },
        ];
      }
      if (direction === "bear" && legType === "put") {
        return [
          { type: "put", action: "buy", strike: s2, price: getRow(s2)?.putAsk ?? 0 },
          { type: "put", action: "sell", strike: s1, price: getRow(s1)?.putBid ?? 0 },
        ];
      }
      if (direction === "bull" && legType === "put") {
        return [
          { type: "put", action: "sell", strike: s2, price: getRow(s2)?.putBid ?? 0 },
          { type: "put", action: "buy", strike: s1, price: getRow(s1)?.putAsk ?? 0 },
        ];
      }
      // bear call
      return [
        { type: "call", action: "sell", strike: s1, price: getRow(s1)?.callBid ?? 0 },
        { type: "call", action: "buy", strike: s2, price: getRow(s2)?.callAsk ?? 0 },
      ];
    }
    case "straddle":
      return [
        { type: "call", action: "buy", strike: atm, price: getRow(atm)?.callAsk ?? 0 },
        { type: "put", action: "buy", strike: atm, price: getRow(atm)?.putAsk ?? 0 },
      ];
    case "strangle": {
      const callS = strikes[Math.min(strikes.length - 1, atmIdx + 2)] ?? atm;
      const putS = strikes[Math.max(0, atmIdx - 2)] ?? atm;
      return [
        { type: "call", action: "buy", strike: callS, price: getRow(callS)?.callAsk ?? 0 },
        { type: "put", action: "buy", strike: putS, price: getRow(putS)?.putAsk ?? 0 },
      ];
    }
    case "iron_condor": {
      const ps = strikes[Math.max(0, atmIdx - 3)] ?? strikes[0];
      const psSell = strikes[Math.max(0, atmIdx - 1)] ?? strikes[0];
      const csSell = strikes[Math.min(strikes.length - 1, atmIdx + 1)] ?? atm;
      const cs = strikes[Math.min(strikes.length - 1, atmIdx + 3)] ?? atm;
      return [
        { type: "put", action: "buy", strike: ps, price: getRow(ps)?.putAsk ?? 0 },
        { type: "put", action: "sell", strike: psSell, price: getRow(psSell)?.putBid ?? 0 },
        { type: "call", action: "sell", strike: csSell, price: getRow(csSell)?.callBid ?? 0 },
        { type: "call", action: "buy", strike: cs, price: getRow(cs)?.callAsk ?? 0 },
      ];
    }
    case "butterfly": {
      const lower = strikes[Math.max(0, atmIdx - 1)] ?? strikes[0];
      const upper = strikes[Math.min(strikes.length - 1, atmIdx + 1)] ?? atm;
      const t = legType;
      const getP = (s: number, a: "buy" | "sell") => {
        const r = getRow(s);
        if (!r) return 0;
        return t === "call" ? (a === "buy" ? r.callAsk : r.callBid) : (a === "buy" ? r.putAsk : r.putBid);
      };
      return [
        { type: t, action: "buy", strike: lower, price: getP(lower, "buy") },
        { type: t, action: "sell", strike: atm, price: getP(atm, "sell") },
        { type: t, action: "sell", strike: atm, price: getP(atm, "sell") },
        { type: t, action: "buy", strike: upper, price: getP(upper, "buy") },
      ];
    }
    case "covered_call": {
      const ccStrike = strikes[Math.min(strikes.length - 1, atmIdx + 1)] ?? atm;
      return [{ type: "call", action: "sell", strike: ccStrike, price: getRow(ccStrike)?.callBid ?? 0 }];
    }
  }
}

function strategyMetrics(legs: StrategyLeg[], contracts: number, mode: StrategyMode) {
  const netPremium = legs.reduce((s, l) => s + (l.action === "sell" ? l.price : -l.price), 0);
  const netCost = -(netPremium * contracts * 100);
  const strikes = legs.map((l) => l.strike).sort((a, b) => a - b);
  const width = strikes.length >= 2 ? strikes[strikes.length - 1] - strikes[0] : 0;

  let maxProfit = "—";
  let maxLoss = "—";
  let breakevens: string[] = [];

  switch (mode) {
    case "vertical": {
      const innerWidth = Math.abs(legs[0].strike - legs[1].strike);
      if (netCost > 0) {
        maxLoss = `$${(netCost).toFixed(2)}`;
        maxProfit = `$${(innerWidth * contracts * 100 - netCost).toFixed(2)}`;
      } else {
        maxProfit = `$${(-netCost).toFixed(2)}`;
        maxLoss = `$${(innerWidth * contracts * 100 + netCost).toFixed(2)}`;
      }
      const be = Math.min(legs[0].strike, legs[1].strike) + Math.abs(netCost) / (contracts * 100);
      breakevens = [`$${be.toFixed(2)}`];
      break;
    }
    case "straddle": {
      maxLoss = `$${netCost.toFixed(2)}`;
      maxProfit = "Unlimited";
      const premium = netCost / (contracts * 100);
      breakevens = [`$${(legs[0].strike - premium).toFixed(2)}`, `$${(legs[0].strike + premium).toFixed(2)}`];
      break;
    }
    case "strangle": {
      maxLoss = `$${netCost.toFixed(2)}`;
      maxProfit = "Unlimited";
      const prem = netCost / (contracts * 100);
      const putStrike = Math.min(legs[0].strike, legs[1].strike);
      const callStrike = Math.max(legs[0].strike, legs[1].strike);
      breakevens = [`$${(putStrike - prem).toFixed(2)}`, `$${(callStrike + prem).toFixed(2)}`];
      break;
    }
    case "iron_condor": {
      maxProfit = `$${(-netCost).toFixed(2)}`;
      const putWidth = Math.abs(strikes[1] - strikes[0]);
      maxLoss = `$${(putWidth * contracts * 100 + netCost).toFixed(2)}`;
      const credit = -netCost / (contracts * 100);
      breakevens = [`$${(strikes[1] - credit).toFixed(2)}`, `$${(strikes[2] + credit).toFixed(2)}`];
      break;
    }
    case "butterfly": {
      const debit = netCost;
      maxLoss = `$${debit.toFixed(2)}`;
      const halfWidth = width / 2;
      maxProfit = `$${(halfWidth * contracts * 100 - debit).toFixed(2)}`;
      const prem = debit / (contracts * 100);
      breakevens = [`$${(strikes[0] + prem).toFixed(2)}`, `$${(strikes[strikes.length - 1] - prem).toFixed(2)}`];
      break;
    }
    case "covered_call": {
      const credit = -netCost;
      maxProfit = `$${credit.toFixed(2)} (premium)`;
      maxLoss = "Stock drops to $0";
      breakevens = ["Stock cost - premium"];
      break;
    }
  }

  return { netCost, maxProfit, maxLoss, breakevens };
}

// ─── Validation Helpers ───
function safePositiveNumber(val: string): number | null {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
function safePositiveInt(val: string): number | null {
  const n = safePositiveNumber(val);
  if (n === null || n !== Math.floor(n)) return null;
  return n;
}

let _orderId = Date.now();
function nextOrderId() { return _orderId++; }

// ─── Component ───
export default function StocksTrading() {
  // Real stock prices
  const [liveQuotes, setLiveQuotes] = useState<Record<string, StockQuote>>({});
  const [pricesLive, setPricesLive] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    if (!isStockApiConfigured()) return;
    setPricesLoading(true);
    fetchStockQuotes(allSymbols).then((quotes) => {
      if (Object.keys(quotes).length > 0) {
        setLiveQuotes(quotes);
        setPricesLive(true);
      }
      setPricesLoading(false);
    });
  }, []);

  // Helper: get effective price/change for a symbol (live if available, else fallback)
  function getPrice(sym: string): { price: number; change: number } {
    const live = liveQuotes[sym];
    if (live) return { price: live.price, change: live.changePct };
    const fallback = marketData[sym];
    if (fallback) return { price: fallback.price, change: fallback.change };
    return { price: 0, change: 0 };
  }

  // Persisted state
  const [holdings, setHoldings] = usePersistedState<Holding[]>("stock-holdings", defaultHoldings);
  const [optionsHoldings, setOptionsHoldings] = usePersistedState<OptionHolding[]>("stock-options", defaultOptionsHoldings);
  const [cashBalance, setCashBalance] = usePersistedState("stock-cash", 0);
  const [orders, setOrders] = usePersistedState<Order[]>("stock-orders", defaultOrders);
  const [watchlist, setWatchlist] = usePersistedState<string[]>("stock-watchlist", ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "SPY"]);

  // Funding source for purchases
  const [fundingSources, setFundingSources] = useState<PaymentMethod[]>([]);
  const [selectedFundingId, setSelectedFundingId] = useState<string | null>(null);
  useEffect(() => {
    setFundingSources(getConnectedPaymentMethods());
    const onStorage = () => setFundingSources(getConnectedPaymentMethods());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const selectedFunding = fundingSources.find((f) => f.id === selectedFundingId) ?? null;

  // Session state
  const [subTab, setSubTab] = useState<SubTab>("positions");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  // Trade form
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [tradeQty, setTradeQty] = useState("");
  const [tradeOrderType, setTradeOrderType] = useState<OrderType>("market");
  const [tradeLimitPrice, setTradeLimitPrice] = useState("");
  const [tradeStopPrice, setTradeStopPrice] = useState("");
  const [tradeTrailingPct, setTradeTrailingPct] = useState("");
  const [tradeTIF, setTradeTIF] = useState<TimeInForce>("day");
  const [tradeFractional, setTradeFractional] = useState(false);
  const [tradeConfirm, setTradeConfirm] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Options form
  const [optSymbol, setOptSymbol] = useState("AAPL");
  const [optExpiry, setOptExpiry] = useState(expirations[3]);
  const [optAction, setOptAction] = useState<"buy" | "sell">("buy");
  const [optType, setOptType] = useState<"call" | "put">("call");
  const [optStrike, setOptStrike] = useState<number | null>(null);
  const [optContracts, setOptContracts] = useState("");
  const [optOrderType, setOptOrderType] = useState<"market" | "limit">("market");
  const [optLimitPrice, setOptLimitPrice] = useState("");
  const [optConfirm, setOptConfirm] = useState(false);
  const [optSuccess, setOptSuccess] = useState(false);

  // Strategy form
  const [stratMode, setStratMode] = useState<StrategyMode>("vertical");
  const [stratSymbol, setStratSymbol] = useState("AAPL");
  const [stratExpiry, setStratExpiry] = useState(expirations[3]);
  const [stratDirection, setStratDirection] = useState<"bull" | "bear">("bull");
  const [stratLegType, setStratLegType] = useState<"call" | "put">("call");
  const [stratContracts, setStratContracts] = useState("1");
  const [stratConfirm, setStratConfirm] = useState(false);
  const [stratSuccess, setStratSuccess] = useState(false);

  // Orders filter
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "filled" | "cancelled">("all");

  // ─── Computed ───
  const portfolioValue = holdings.reduce((sum, h) => sum + getPrice(h.symbol).price * h.shares, 0);
  const portfolioCost = holdings.reduce((sum, h) => sum + h.avgCost * h.shares, 0);
  const portfolioPL = portfolioValue - portfolioCost;
  const dayPL = holdings.reduce((sum, h) => {
    const { price, change } = getPrice(h.symbol);
    return sum + (price * h.shares * (change / 100));
  }, 0);
  const totalValue = cashBalance + portfolioValue;
  const _buyingPower = cashBalance * 2;

  const tradeStock = marketData[tradeSymbol.toUpperCase()];
  const liveTradePrice = getPrice(tradeSymbol.toUpperCase()).price || tradeStock?.price || 0;
  const tradePrice = tradeOrderType === "limit" || tradeOrderType === "stop_limit"
    ? (safePositiveNumber(tradeLimitPrice) ?? liveTradePrice)
    : liveTradePrice;
  const tradeQtyN = safePositiveNumber(tradeQty) ?? 0;
  const tradeEstTotal = tradePrice * tradeQtyN;

  const optStock = marketData[optSymbol];
  const liveOptPrice = getPrice(optSymbol).price || optStock?.price || 0;
  const optChain = useMemo(() => optStock ? generateChain(optSymbol, liveOptPrice, optExpiry) : [], [optSymbol, liveOptPrice, optExpiry]);
  const selectedOptRow = optChain.find((r) => r.strike === optStrike);
  const optPrice = optOrderType === "limit" && optLimitPrice
    ? (safePositiveNumber(optLimitPrice) ?? 0)
    : selectedOptRow
      ? (optType === "call" ? (optAction === "buy" ? selectedOptRow.callAsk : selectedOptRow.callBid) : (optAction === "buy" ? selectedOptRow.putAsk : selectedOptRow.putBid))
      : 0;
  const optContractsN = safePositiveInt(optContracts) ?? 0;
  const optEstTotal = optPrice * optContractsN * 100;

  const stratStock = marketData[stratSymbol];
  const stratChain = useMemo(() => stratStock ? generateChain(stratSymbol, stratStock.price, stratExpiry) : [], [stratSymbol, stratStock?.price, stratExpiry]);
  const stratLegs = useMemo(() =>
    stratChain.length > 0 && stratStock
      ? autoFillLegs(stratMode, stratChain, stratStock.price, stratDirection, stratLegType)
      : [],
    [stratMode, stratChain, stratStock?.price, stratDirection, stratLegType]
  );
  const stratContractsN = safePositiveInt(stratContracts) ?? 0;
  const stratMetrics = useMemo(() => stratLegs.length > 0 && stratContractsN > 0 ? strategyMetrics(stratLegs, stratContractsN, stratMode) : null, [stratLegs, stratContractsN, stratMode]);

  const filteredOrders = orders.filter((o) => orderFilter === "all" || o.status === orderFilter);
  const searchResults = searchQuery
    ? allSymbols.filter((s) => s.includes(searchQuery.toUpperCase()) || marketData[s].name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  // ─── Handlers (Security-hardened) ───
  function placeTrade() {
    if (!tradeStock) return;
    const sym = tradeSymbol.toUpperCase();
    const qty = tradeFractional ? safePositiveNumber(tradeQty) : safePositiveInt(tradeQty);
    if (qty === null) return;

    const price = tradeOrderType === "market" ? tradeStock.price : (safePositiveNumber(tradeLimitPrice) ?? tradeStock.price);
    if (price <= 0) return;
    if ((tradeOrderType === "stop" || tradeOrderType === "stop_limit") && !(safePositiveNumber(tradeStopPrice))) return;
    if (tradeOrderType === "trailing_stop" && !(safePositiveNumber(tradeTrailingPct))) return;

    const cost = price * qty;
    const isMarket = tradeOrderType === "market";

    if (tradeAction === "buy") {
      // Fund exact amount from selected payment method (just-in-time funding)
      if (cost > cashBalance) {
        if (!selectedFunding) return; // no funding source selected
        const deficit = cost - cashBalance;
        setCashBalance((c) => c + deficit); // deposit only what's needed
        pushActivity(`Funded $${deficit.toFixed(2)} from ${fundingLabel(selectedFunding)}`, "FN", "bg-emerald-600");
      }
      if (isMarket) {
        setCashBalance((c) => {
          if (cost > c) return c;
          return c - cost;
        });
        setHoldings((prev) => {
          const existing = prev.find((h) => h.symbol === sym);
          if (existing) {
            const totalShares = existing.shares + qty;
            const totalCost = existing.avgCost * existing.shares + price * qty;
            return prev.map((h) => h.symbol === sym ? { ...h, shares: totalShares, avgCost: totalCost / totalShares } : h);
          }
          return [...prev, { symbol: sym, shares: qty, avgCost: price }];
        });
      }
    } else {
      const existing = holdings.find((h) => h.symbol === sym);
      if (!existing || existing.shares < qty) return;
      if (isMarket) {
        setCashBalance((c) => c + cost);
        setHoldings((prev) => {
          const ex = prev.find((h) => h.symbol === sym);
          if (!ex || ex.shares < qty) return prev;
          return prev.map((h) => h.symbol === sym ? { ...h, shares: h.shares - qty } : h).filter((h) => h.shares > 0);
        });
      }
    }

    const orderTypeLabel = tradeOrderType === "market" ? "Market" : tradeOrderType === "limit" ? "Limit" : tradeOrderType === "stop" ? "Stop" : tradeOrderType === "stop_limit" ? "Stop-Limit" : "Trailing Stop";
    setOrders((prev) => [{
      id: nextOrderId(), date: new Date().toISOString().slice(0, 10), action: tradeAction, symbol: sym,
      description: sym, quantity: qty, price, orderType: orderTypeLabel,
      status: isMarket ? "filled" : "pending", filledPrice: isMarket ? price : undefined,
    }, ...prev]);

    pushActivity(`${tradeAction === "buy" ? "Bought" : "Sold"} ${qty} ${sym} @ $${price.toFixed(2)}`, sym.slice(0, 2), "bg-emerald-600");
    setTradeSuccess(true);
    setTradeConfirm(false);
    setTimeout(() => { setTradeSuccess(false); setTradeQty(""); }, 2000);
  }

  function placeOptionTrade() {
    if (!optStrike || !optStock) return;
    const qty = safePositiveInt(optContracts);
    if (qty === null) return;
    if (optPrice <= 0) return;
    const cost = optPrice * qty * 100;

    if (optAction === "buy") {
      if (cost > cashBalance) {
        if (!selectedFunding) return;
        const deficit = cost - cashBalance;
        setCashBalance((c) => c + deficit);
        pushActivity(`Funded $${deficit.toFixed(2)} from ${fundingLabel(selectedFunding)}`, "FN", "bg-emerald-600");
      }
      setCashBalance((c) => {
        if (cost > c) return c;
        return c - cost;
      });
      setOptionsHoldings((prev) => [...prev, { symbol: optSymbol, type: optType, strike: optStrike, expiry: optExpiry, contracts: qty, avgCost: optPrice }]);
    } else {
      // Selling: must own the contracts (no naked selling of single legs)
      const existing = optionsHoldings.find((o) => o.symbol === optSymbol && o.type === optType && o.strike === optStrike && o.expiry === optExpiry);
      if (!existing || existing.contracts < qty) return;
      setCashBalance((c) => c + cost);
      setOptionsHoldings((prev) => {
        const idx = prev.findIndex((o) => o.symbol === optSymbol && o.type === optType && o.strike === optStrike && o.expiry === optExpiry);
        if (idx === -1 || prev[idx].contracts < qty) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], contracts: updated[idx].contracts - qty };
        return updated.filter((o) => o.contracts > 0);
      });
    }

    const desc = `${optSymbol} ${optType === "call" ? "Call" : "Put"} $${optStrike} ${optExpiry.slice(5)}`;
    setOrders((prev) => [{
      id: nextOrderId(), date: new Date().toISOString().slice(0, 10), action: optAction, symbol: desc,
      description: desc, quantity: qty, price: optPrice, orderType: optOrderType === "limit" ? "Limit" : "Market",
      status: optOrderType === "limit" ? "pending" : "filled", filledPrice: optOrderType === "limit" ? undefined : optPrice,
    }, ...prev]);

    const desc2 = `${optSymbol} ${optType === "call" ? "Call" : "Put"} $${optStrike} ${optExpiry.slice(5)}`;
    pushActivity(`${optAction === "buy" ? "Bought" : "Sold"} ${qty}x ${desc2}`, "OP", "bg-violet-600");
    setOptSuccess(true);
    setOptConfirm(false);
    setTimeout(() => { setOptSuccess(false); setOptContracts(""); setOptStrike(null); }, 2000);
  }

  function placeStrategyOrder() {
    if (stratLegs.length === 0 || stratContractsN <= 0 || !stratMetrics) return;

    // Covered call check: must own enough stock
    if (stratMode === "covered_call") {
      const held = holdings.find((h) => h.symbol === stratSymbol);
      if (!held || held.shares < stratContractsN * 100) return;
    }

    const netCost = stratMetrics.netCost;
    if (netCost > 0 && netCost > cashBalance) {
      if (!selectedFunding) return;
      const deficit = netCost - cashBalance;
      setCashBalance((c) => c + deficit);
      pushActivity(`Funded $${deficit.toFixed(2)} from ${fundingLabel(selectedFunding)}`, "FN", "bg-emerald-600");
    }

    // Debit or credit
    setCashBalance((c) => {
      const newBal = c - netCost;
      if (newBal < 0 && netCost > 0) return c;
      return newBal;
    });

    // Add each leg as an options holding
    for (const leg of stratLegs) {
      if (leg.action === "buy") {
        setOptionsHoldings((prev) => [...prev, {
          symbol: stratSymbol, type: leg.type, strike: leg.strike, expiry: stratExpiry,
          contracts: stratContractsN, avgCost: leg.price,
        }]);
      }
      // Sell legs in defined-risk strategies are covered by buy legs — record as negative position
    }

    const stratName = STRATEGY_INFO[stratMode].name;
    const strikesStr = stratLegs.map((l) => `$${l.strike}`).join("/");
    const desc = `${stratName}: ${stratSymbol} ${strikesStr} ${stratExpiry.slice(5)}`;
    setOrders((prev) => [{
      id: nextOrderId(), date: new Date().toISOString().slice(0, 10),
      action: netCost > 0 ? "buy" : "sell", symbol: desc, description: desc,
      quantity: stratContractsN, price: Math.abs(netCost) / (stratContractsN * 100),
      orderType: "Market", status: "filled", filledPrice: Math.abs(netCost) / (stratContractsN * 100),
    }, ...prev]);

    pushActivity(`Strategy: ${STRATEGY_INFO[stratMode].name} on ${stratSymbol}`, "ST", "bg-violet-600");
    setStratSuccess(true);
    setStratConfirm(false);
    setTimeout(() => { setStratSuccess(false); }, 2000);
  }

  function cancelOrder(id: number) {
    setOrders((prev) => prev.map((o) => o.id === id && o.status === "pending" ? { ...o, status: "cancelled" as const } : o));
  }

  // ─── Render ───
  return (
    <div>
      {/* Account Summary */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-[10px] text-omn-text uppercase tracking-wide">Total Value</p>
            <p className="text-lg font-bold font-mono text-omn-heading">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] text-omn-text uppercase tracking-wide">Cash</p>
            <p className="text-lg font-bold font-mono text-omn-heading">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {cashBalance === 0 && fundingSources.length > 0 && (
              <p className="text-[10px] text-omn-success">Funded on purchase</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-omn-text uppercase tracking-wide">Funding Sources</p>
            <p className="text-lg font-bold font-mono text-omn-primary">{fundingSources.length}</p>
            <p className="text-[10px] text-omn-text">{fundingSources.length > 0 ? fundingSources.map((f) => fundingLabel(f)).join(", ") : "None linked"}</p>
          </div>
          <div>
            <p className="text-[10px] text-omn-text uppercase tracking-wide">Total P&L</p>
            <p className={`text-lg font-bold font-mono ${portfolioPL >= 0 ? "text-omn-success" : "text-omn-danger"}`}>
              {portfolioPL >= 0 ? "+" : ""}${portfolioPL.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-omn-text uppercase tracking-wide">Day Change</p>
            <p className={`text-lg font-bold font-mono ${dayPL >= 0 ? "text-omn-success" : "text-omn-danger"}`}>
              {dayPL >= 0 ? "+" : ""}${dayPL.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Nav */}
      <div className="flex gap-1 mb-6 border-b border-omn-border overflow-x-auto">
        {([["positions", "Positions"], ["trade", "Trade"], ["options", "Options"], ["strategies", "Strategies"], ["orders", "Orders"]] as [SubTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setSubTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              subTab === key ? "border-omn-primary text-omn-primary" : "border-transparent text-omn-text hover:text-omn-heading"
            }`}>{label}</button>
        ))}
      </div>

      {/* ═══ POSITIONS ═══ */}
      {subTab === "positions" && (
        <div className="space-y-6">
          <div className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-omn-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-omn-heading">Stock Positions ({holdings.length})</h3>
                {pricesLive && <span className="text-[10px] px-1.5 py-0.5 bg-omn-success/20 text-omn-success rounded-full">Live</span>}
                {pricesLoading && <div className="animate-spin w-3 h-3 border border-omn-primary border-t-transparent rounded-full" />}
              </div>
              <span className="text-xs font-mono text-omn-accent">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2 text-[10px] text-omn-text uppercase tracking-wide border-b border-omn-border/50">
              <span>Symbol</span><span className="text-right">Shares</span><span className="text-right">Avg Cost</span><span className="text-right">Current</span><span className="text-right">P&L</span><span className="text-right">Day</span>
            </div>
            {holdings.map((h) => {
              const md = marketData[h.symbol];
              if (!md) return null;
              const { price: curPrice, change: chg } = getPrice(h.symbol);
              const value = curPrice * h.shares;
              const cost = h.avgCost * h.shares;
              const pl = value - cost;
              const plPct = ((curPrice - h.avgCost) / h.avgCost * 100);
              const dayChg = value * (chg / 100);
              return (
                <div key={h.symbol} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-omn-border/30 items-center hover:bg-omn-bg/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-omn-primary/20 rounded flex items-center justify-center text-omn-primary text-[10px] font-bold">{h.symbol.slice(0, 2)}</div>
                    <div><p className="text-sm font-medium text-omn-heading">{h.symbol}</p><p className="text-[10px] text-omn-text">{md.name}</p></div>
                  </div>
                  <p className="text-sm font-mono text-omn-heading text-right">{h.shares}</p>
                  <p className="text-sm font-mono text-omn-text text-right">${h.avgCost.toFixed(2)}</p>
                  <p className="text-sm font-mono text-omn-heading text-right">${curPrice.toFixed(2)}</p>
                  <div className="text-right">
                    <p className={`text-sm font-mono ${pl >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{pl >= 0 ? "+" : ""}${pl.toFixed(2)}</p>
                    <p className={`text-[10px] font-mono ${pl >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%</p>
                  </div>
                  <p className={`text-sm font-mono text-right ${dayChg >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{dayChg >= 0 ? "+" : ""}${dayChg.toFixed(2)}</p>
                </div>
              );
            })}
            {holdings.length === 0 && <p className="px-4 py-6 text-center text-sm text-omn-text">No stock positions. Go to Trade to buy stocks.</p>}
          </div>

          {/* Options Holdings */}
          <div className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-omn-border">
              <h3 className="text-sm font-semibold text-omn-heading">Options Positions ({optionsHoldings.length})</h3>
            </div>
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2 text-[10px] text-omn-text uppercase tracking-wide border-b border-omn-border/50">
              <span>Contract</span><span className="text-right">Type</span><span className="text-right">Contracts</span><span className="text-right">Avg Cost</span><span className="text-right">Current</span><span className="text-right">P&L</span>
            </div>
            {optionsHoldings.map((o, i) => {
              const md = marketData[o.symbol];
              if (!md) return null;
              const chain = generateChain(o.symbol, md.price, o.expiry);
              const row = chain.find((r) => Math.abs(r.strike - o.strike) < 0.01);
              const current = row ? (o.type === "call" ? row.callLast : row.putLast) : o.avgCost;
              const pl = (current - o.avgCost) * o.contracts * 100;
              return (
                <div key={`${o.symbol}-${o.type}-${o.strike}-${o.expiry}-${i}`} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-omn-border/30 items-center hover:bg-omn-bg/50">
                  <div>
                    <p className="text-sm font-medium text-omn-heading">{o.symbol} ${o.strike} {o.expiry.slice(5)}</p>
                    <p className="text-[10px] text-omn-text">Exp: {o.expiry}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-right ${o.type === "call" ? "bg-omn-success/20 text-omn-success" : "bg-omn-danger/20 text-omn-danger"}`}>{o.type === "call" ? "CALL" : "PUT"}</span>
                  <p className="text-sm font-mono text-omn-heading text-right">{o.contracts}</p>
                  <p className="text-sm font-mono text-omn-text text-right">${o.avgCost.toFixed(2)}</p>
                  <p className="text-sm font-mono text-omn-heading text-right">${current.toFixed(2)}</p>
                  <p className={`text-sm font-mono text-right ${pl >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{pl >= 0 ? "+" : ""}${pl.toFixed(2)}</p>
                </div>
              );
            })}
            {optionsHoldings.length === 0 && <p className="px-4 py-6 text-center text-sm text-omn-text">No options positions.</p>}
          </div>

          {/* Watchlist */}
          <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-omn-heading">Watchlist</h3>
              <button onClick={() => setAddingToWatchlist(!addingToWatchlist)} className="text-xs text-omn-primary hover:text-omn-primary-light">{addingToWatchlist ? "Done" : "+ Add"}</button>
            </div>
            {addingToWatchlist && (
              <div className="mb-3">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search symbol..."
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading focus:outline-none focus:border-omn-primary mb-1" />
                {searchResults.filter((s) => !watchlist.includes(s)).map((s) => (
                  <button key={s} onClick={() => { setWatchlist((p) => [...p, s]); setSearchQuery(""); }} className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-omn-bg rounded text-left">
                    <span className="text-sm text-omn-heading">{s}</span><span className="text-xs text-omn-text">{marketData[s].name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-1">
              {watchlist.map((sym) => {
                const md = marketData[sym];
                if (!md) return null;
                const { price, change } = getPrice(sym);
                return (
                  <div key={sym} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-omn-bg/50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-omn-heading">{sym}</span>
                      <span className="text-xs text-omn-text">{md.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-omn-heading">${price.toFixed(2)}</span>
                      <span className={`text-xs font-mono ${change >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</span>
                      {addingToWatchlist && <button onClick={() => setWatchlist((p) => p.filter((s) => s !== sym))} className="text-xs text-omn-danger">x</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRADE ═══ */}
      {subTab === "trade" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
              <input type="text" value={tradeSymbol} onChange={(e) => { setTradeSymbol(e.target.value.toUpperCase()); setTradeConfirm(false); setTradeSuccess(false); }}
                placeholder="Enter symbol (e.g. AAPL)"
                className="w-full px-4 py-3 bg-omn-bg border border-omn-border rounded-lg text-omn-heading font-mono text-lg focus:outline-none focus:border-omn-primary" />
              {tradeSymbol && !tradeStock && <p className="text-xs text-omn-danger mt-2">Symbol not found</p>}
            </div>
            {tradeStock && (
              <div className="bg-omn-surface border border-omn-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-omn-heading">{tradeSymbol.toUpperCase()}</h3>
                    <p className="text-sm text-omn-text">{tradeStock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-omn-heading">${tradeStock.price.toFixed(2)}</p>
                    <p className={`text-sm font-mono ${tradeStock.change >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{tradeStock.change >= 0 ? "+" : ""}{tradeStock.change}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><p className="text-omn-text">Volume</p><p className="font-mono text-omn-heading">{tradeStock.volume}</p></div>
                  <div><p className="text-omn-text">Mkt Cap</p><p className="font-mono text-omn-heading">{tradeStock.marketCap}</p></div>
                  <div><p className="text-omn-text">P/E</p><p className="font-mono text-omn-heading">{tradeStock.pe || "N/A"}</p></div>
                  <div><p className="text-omn-text">52W High</p><p className="font-mono text-omn-heading">${tradeStock.week52High.toFixed(2)}</p></div>
                  <div><p className="text-omn-text">52W Low</p><p className="font-mono text-omn-heading">${tradeStock.week52Low.toFixed(2)}</p></div>
                  <div><p className="text-omn-text">Sector</p><p className="font-mono text-omn-heading">{tradeStock.sector}</p></div>
                </div>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-omn-surface border border-omn-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-omn-heading mb-4">Place Order</h3>
            <div className="flex gap-1 mb-4 bg-omn-bg rounded-lg p-1">
              <button onClick={() => setTradeAction("buy")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tradeAction === "buy" ? "bg-omn-success text-white" : "text-omn-text hover:text-omn-heading"}`}>Buy</button>
              <button onClick={() => setTradeAction("sell")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tradeAction === "sell" ? "bg-omn-danger text-white" : "text-omn-text hover:text-omn-heading"}`}>Sell</button>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-omn-text">Quantity</label>
                <label className="flex items-center gap-1 text-xs text-omn-text">
                  <input type="checkbox" checked={tradeFractional} onChange={(e) => setTradeFractional(e.target.checked)} className="rounded" />
                  Fractional
                </label>
              </div>
              <input type="number" value={tradeQty} onChange={(e) => setTradeQty(e.target.value)} placeholder={tradeFractional ? "0.5" : "1"} step={tradeFractional ? "0.01" : "1"} min="0.01"
                className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
            </div>

            <div className="mb-3">
              <label className="text-xs text-omn-text block mb-1">Order Type</label>
              <select value={tradeOrderType} onChange={(e) => setTradeOrderType(e.target.value as OrderType)}
                className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading focus:outline-none focus:border-omn-primary">
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
                <option value="stop_limit">Stop-Limit</option>
                <option value="trailing_stop">Trailing Stop</option>
              </select>
            </div>

            {(tradeOrderType === "limit" || tradeOrderType === "stop_limit") && (
              <div className="mb-3">
                <label className="text-xs text-omn-text block mb-1">Limit Price</label>
                <input type="number" value={tradeLimitPrice} onChange={(e) => setTradeLimitPrice(e.target.value)} placeholder="0.00" step="0.01" min="0.01"
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
              </div>
            )}
            {(tradeOrderType === "stop" || tradeOrderType === "stop_limit") && (
              <div className="mb-3">
                <label className="text-xs text-omn-text block mb-1">Stop Price</label>
                <input type="number" value={tradeStopPrice} onChange={(e) => setTradeStopPrice(e.target.value)} placeholder="0.00" step="0.01" min="0.01"
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
              </div>
            )}
            {tradeOrderType === "trailing_stop" && (
              <div className="mb-3">
                <label className="text-xs text-omn-text block mb-1">Trail %</label>
                <input type="number" value={tradeTrailingPct} onChange={(e) => setTradeTrailingPct(e.target.value)} placeholder="5" step="0.5" min="0.5"
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
              </div>
            )}

            <div className="mb-3">
              <label className="text-xs text-omn-text block mb-1">Time in Force</label>
              <div className="flex gap-2">
                {([["day", "Day"], ["gtc", "GTC"], ["ext", "Ext Hours"]] as [TimeInForce, string][]).map(([val, lbl]) => (
                  <button key={val} onClick={() => setTradeTIF(val)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${tradeTIF === val ? "bg-omn-primary text-white" : "bg-omn-bg border border-omn-border text-omn-text"}`}>{lbl}</button>
                ))}
              </div>
            </div>

            {tradeStock && tradeQtyN > 0 && (
              <div className="bg-omn-bg rounded-lg p-3 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-omn-text">Estimated {tradeAction === "buy" ? "Cost" : "Proceeds"}</span>
                  <span className="text-omn-heading font-mono font-bold">${tradeEstTotal.toFixed(2)}</span>
                </div>
                {tradeAction === "sell" && (() => { const h = holdings.find((x) => x.symbol === tradeSymbol.toUpperCase()); return (!h || h.shares < tradeQtyN) ? <p className="text-xs text-omn-danger mt-1">Not enough shares (own: {h?.shares ?? 0})</p> : null; })()}
              </div>
            )}

            {/* Funding source selector (for buys when cash is insufficient) */}
            {tradeAction === "buy" && tradeEstTotal > cashBalance && (
              <div className="bg-omn-bg rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-omn-heading mb-2">Fund from</p>
                {fundingSources.length === 0 ? (
                  <p className="text-xs text-omn-danger">No payment methods connected. Go to Payments to link one.</p>
                ) : (
                  <div className="space-y-1.5">
                    {fundingSources.map((fs) => (
                      <button key={fs.id} onClick={() => setSelectedFundingId(fs.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${selectedFundingId === fs.id ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"}`}>
                        <div className={`w-6 h-6 ${fs.color} rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>{fs.icon}</div>
                        <span className="text-xs text-omn-heading flex-1">{fundingLabel(fs)}</span>
                        {selectedFundingId === fs.id && <span className="text-omn-primary text-xs">{"\u2713"}</span>}
                      </button>
                    ))}
                    <p className="text-[10px] text-omn-text mt-1">
                      ${(tradeEstTotal - cashBalance).toFixed(2)} will be deposited from {selectedFunding ? fundingLabel(selectedFunding) : "..."} to cover this order.
                    </p>
                  </div>
                )}
              </div>
            )}

            {tradeSuccess && (
              <div className="bg-omn-success/10 border border-omn-success/30 rounded-lg p-3 mb-4 text-center">
                <p className="text-sm text-omn-success font-medium">Order placed!</p>
              </div>
            )}

            {!tradeConfirm ? (
              <button onClick={() => setTradeConfirm(true)}
                disabled={!tradeStock || tradeQtyN <= 0 || (tradeAction === "buy" && tradeEstTotal > cashBalance && !selectedFunding) || (tradeAction === "sell" && (() => { const h = holdings.find((x) => x.symbol === tradeSymbol.toUpperCase()); return !h || h.shares < tradeQtyN; })())}
                className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tradeAction === "buy" ? "bg-omn-success hover:bg-omn-success/80 text-white" : "bg-omn-danger hover:bg-omn-danger/80 text-white"}`}>
                Review {tradeAction === "buy" ? "Buy" : "Sell"} Order
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-omn-bg rounded-lg p-3 text-xs space-y-1">
                  <p className="text-omn-heading font-medium">{tradeAction.toUpperCase()} {tradeQty} {tradeSymbol.toUpperCase()}</p>
                  <p className="text-omn-text">Type: {tradeOrderType.replace("_", "-")} | TIF: {tradeTIF.toUpperCase()}</p>
                  <p className="text-omn-accent font-mono">Est. ${tradeEstTotal.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTradeConfirm(false)} className="flex-1 py-2.5 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text">Cancel</button>
                  <button onClick={placeTrade} className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white ${tradeAction === "buy" ? "bg-omn-success" : "bg-omn-danger"}`}>Confirm {tradeAction === "buy" ? "Buy" : "Sell"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ OPTIONS ═══ */}
      {subTab === "options" && (
        <div className="space-y-6">
          {/* Underlying + Expiry */}
          <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div>
                <label className="text-xs text-omn-text block mb-1">Underlying</label>
                <select value={optSymbol} onChange={(e) => { setOptSymbol(e.target.value); setOptStrike(null); }}
                  className="px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary">
                  {optionableSymbols.map((s) => <option key={s} value={s}>{s} — ${getPrice(s).price.toFixed(2)}</option>)}
                </select>
              </div>
              {optStock && (
                <div>
                  <p className="text-xs text-omn-text mb-1">{optStock.name}</p>
                  <p className="text-lg font-bold font-mono text-omn-heading">${optStock.price.toFixed(2)} <span className={`text-sm ${optStock.change >= 0 ? "text-omn-success" : "text-omn-danger"}`}>{optStock.change >= 0 ? "+" : ""}{optStock.change}%</span></p>
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {expirations.map((exp) => (
                <button key={exp} onClick={() => { setOptExpiry(exp); setOptStrike(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${optExpiry === exp ? "bg-omn-primary text-white" : "bg-omn-bg border border-omn-border text-omn-text hover:text-omn-heading"}`}>
                  {new Date(exp + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chain */}
            <div className="lg:col-span-2 bg-omn-surface border border-omn-border rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-omn-border text-[10px] text-omn-text uppercase tracking-wide">
                    <th colSpan={6} className="px-2 py-2 text-center bg-omn-success/10 text-omn-success font-semibold">Calls</th>
                    <th className="px-2 py-2 text-center font-semibold">Strike</th>
                    <th colSpan={6} className="px-2 py-2 text-center bg-omn-danger/10 text-omn-danger font-semibold">Puts</th>
                  </tr>
                  <tr className="border-b border-omn-border/50 bg-omn-bg/50 text-[9px] text-omn-text">
                    <th className="px-1 py-1">Bid</th><th className="px-1 py-1">Ask</th><th className="px-1 py-1">Vol</th>
                    <th className="px-1 py-1">IV</th><th className="px-1 py-1">{"\u0394"}</th><th className="px-1 py-1">{"\u0398"}</th>
                    <th className="px-1 py-1">$</th>
                    <th className="px-1 py-1">Bid</th><th className="px-1 py-1">Ask</th><th className="px-1 py-1">Vol</th>
                    <th className="px-1 py-1">IV</th><th className="px-1 py-1">{"\u0394"}</th><th className="px-1 py-1">{"\u0398"}</th>
                  </tr>
                </thead>
                <tbody>
                  {optChain.map((row) => {
                    const isATM = optStock && Math.abs(row.strike - optStock.price) < (optStock.price > 100 ? 2.5 : 1);
                    const isSelected = row.strike === optStrike;
                    return (
                      <tr key={row.strike}
                        className={`border-b border-omn-border/20 cursor-pointer transition-colors ${isATM ? "bg-omn-primary/5" : ""} ${isSelected ? "bg-omn-accent/10" : "hover:bg-omn-bg/50"}`}
                        onClick={() => setOptStrike(row.strike)}>
                        <td className="px-1 py-1.5 font-mono text-omn-success">{row.callBid.toFixed(2)}</td>
                        <td className="px-1 py-1.5 font-mono text-omn-heading">{row.callAsk.toFixed(2)}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.callVol > 1000 ? (row.callVol / 1000).toFixed(1) + "K" : row.callVol}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.callIV}%</td>
                        <td className="px-1 py-1.5 text-omn-primary">{row.callDelta.toFixed(2)}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.callTheta.toFixed(2)}</td>
                        <td className={`px-1 py-1.5 text-center font-mono font-bold ${isATM ? "text-omn-primary" : "text-omn-heading"}`}>${row.strike.toFixed(0)}</td>
                        <td className="px-1 py-1.5 font-mono text-omn-danger">{row.putBid.toFixed(2)}</td>
                        <td className="px-1 py-1.5 font-mono text-omn-heading">{row.putAsk.toFixed(2)}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.putVol > 1000 ? (row.putVol / 1000).toFixed(1) + "K" : row.putVol}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.putIV}%</td>
                        <td className="px-1 py-1.5 text-omn-primary">{row.putDelta.toFixed(2)}</td>
                        <td className="px-1 py-1.5 text-omn-text">{row.putTheta.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Single-Leg Order Form */}
            <div className="bg-omn-surface border border-omn-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-omn-heading mb-4">Trade Option</h3>
              {!optStrike ? (
                <p className="text-sm text-omn-text text-center py-8">Click a strike price in the chain to trade</p>
              ) : (
                <>
                  {/* Greeks detail for selected strike */}
                  {selectedOptRow && (
                    <div className="bg-omn-bg rounded-lg p-3 mb-4">
                      <p className="text-sm font-mono text-omn-heading mb-2">{optSymbol} ${optStrike} {optExpiry.slice(5)}</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex justify-between"><span className="text-omn-text">{"\u0394"} Delta</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callDelta : selectedOptRow.putDelta).toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-omn-text">{"\u0393"} Gamma</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callGamma : selectedOptRow.putGamma).toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-omn-text">{"\u0398"} Theta</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callTheta : selectedOptRow.putTheta).toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-omn-text">{"\u039D"} Vega</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callVega : selectedOptRow.putVega).toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-omn-text">IV</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callIV : selectedOptRow.putIV)}%</span></div>
                        <div className="flex justify-between"><span className="text-omn-text">OI</span><span className="font-mono text-omn-heading">{(optType === "call" ? selectedOptRow.callOI : selectedOptRow.putOI).toLocaleString()}</span></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 mb-3 bg-omn-bg rounded-lg p-1">
                    <button onClick={() => setOptAction("buy")} className={`flex-1 py-2 rounded-md text-xs font-medium ${optAction === "buy" ? "bg-omn-success text-white" : "text-omn-text"}`}>Buy</button>
                    <button onClick={() => setOptAction("sell")} className={`flex-1 py-2 rounded-md text-xs font-medium ${optAction === "sell" ? "bg-omn-danger text-white" : "text-omn-text"}`}>Sell</button>
                  </div>

                  <div className="flex gap-1 mb-3 bg-omn-bg rounded-lg p-1">
                    <button onClick={() => setOptType("call")} className={`flex-1 py-2 rounded-md text-xs font-medium ${optType === "call" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Call</button>
                    <button onClick={() => setOptType("put")} className={`flex-1 py-2 rounded-md text-xs font-medium ${optType === "put" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Put</button>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs text-omn-text block mb-1">Contracts (100 shares each)</label>
                    <input type="number" value={optContracts} onChange={(e) => setOptContracts(e.target.value)} placeholder="1" min="1" step="1"
                      className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
                  </div>

                  <div className="mb-3">
                    <label className="text-xs text-omn-text block mb-1">Order Type</label>
                    <div className="flex gap-1 bg-omn-bg rounded-lg p-1">
                      <button onClick={() => setOptOrderType("market")} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${optOrderType === "market" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Market</button>
                      <button onClick={() => setOptOrderType("limit")} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${optOrderType === "limit" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Limit</button>
                    </div>
                  </div>
                  {optOrderType === "limit" && (
                    <div className="mb-3">
                      <input type="number" value={optLimitPrice} onChange={(e) => setOptLimitPrice(e.target.value)} placeholder="Limit price" step="0.01" min="0.01"
                        className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
                    </div>
                  )}

                  {optContractsN > 0 && (
                    <div className="bg-omn-bg rounded-lg p-3 mb-4 text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-omn-text">Premium</span><span className="font-mono text-omn-heading">${optPrice.toFixed(2)} x 100 = ${(optPrice * 100).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-omn-text">Total {optAction === "buy" ? "cost" : "credit"}</span><span className="font-mono font-bold text-omn-accent">${optEstTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-omn-text">Max {optAction === "buy" ? "loss" : "risk"}</span><span className="font-mono text-omn-heading">{optAction === "buy" ? `$${optEstTotal.toFixed(2)}` : "Must own contracts"}</span></div>
                      {optAction === "buy" && optEstTotal > cashBalance && !selectedFunding && <p className="text-omn-danger">Select a funding source below</p>}
                      {optAction === "sell" && (() => {
                        const ex = optionsHoldings.find((o) => o.symbol === optSymbol && o.type === optType && o.strike === optStrike && o.expiry === optExpiry);
                        return (!ex || ex.contracts < optContractsN) ? <p className="text-omn-danger">You don't own enough contracts to sell (no naked selling)</p> : null;
                      })()}
                    </div>
                  )}

                  {optSuccess && (
                    <div className="bg-omn-success/10 border border-omn-success/30 rounded-lg p-3 mb-4 text-center">
                      <p className="text-sm text-omn-success font-medium">Options order placed!</p>
                    </div>
                  )}

                  {/* Funding source for options buys */}
                  {optAction === "buy" && optEstTotal > cashBalance && (
                    <div className="bg-omn-bg rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-omn-heading mb-2">Fund from</p>
                      {fundingSources.length === 0 ? (
                        <p className="text-xs text-omn-danger">No payment methods connected.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {fundingSources.map((fs) => (
                            <button key={fs.id} onClick={() => setSelectedFundingId(fs.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${selectedFundingId === fs.id ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"}`}>
                              <div className={`w-6 h-6 ${fs.color} rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>{fs.icon}</div>
                              <span className="text-xs text-omn-heading flex-1">{fundingLabel(fs)}</span>
                              {selectedFundingId === fs.id && <span className="text-omn-primary text-xs">{"\u2713"}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!optConfirm ? (
                    <button onClick={() => setOptConfirm(true)}
                      disabled={optContractsN <= 0 || (optAction === "buy" && optEstTotal > cashBalance && !selectedFunding) || (optAction === "sell" && (() => { const ex = optionsHoldings.find((o) => o.symbol === optSymbol && o.type === optType && o.strike === optStrike && o.expiry === optExpiry); return !ex || ex.contracts < optContractsN; })())}
                      className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 ${optAction === "buy" ? "bg-omn-success" : "bg-omn-danger"}`}>
                      Review {optAction === "buy" ? "Buy" : "Sell"} {optType === "call" ? "Call" : "Put"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-omn-bg rounded-lg p-3 text-xs">
                        <p className="text-omn-heading font-medium">{optAction.toUpperCase()} {optContracts}x {optSymbol} ${optStrike} {optType.toUpperCase()}</p>
                        <p className="text-omn-text">Exp: {optExpiry} | {optOrderType === "limit" ? `Limit $${optLimitPrice}` : "Market"}</p>
                        <p className="text-omn-accent font-mono">Total: ${optEstTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setOptConfirm(false)} className="flex-1 py-2.5 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text">Cancel</button>
                        <button onClick={placeOptionTrade} className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white ${optAction === "buy" ? "bg-omn-success" : "bg-omn-danger"}`}>Confirm</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STRATEGIES ═══ */}
      {subTab === "strategies" && (
        <div className="space-y-6">
          {/* Strategy Mode Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(STRATEGY_INFO) as StrategyMode[]).map((mode) => (
              <button key={mode} onClick={() => { setStratMode(mode); setStratConfirm(false); setStratSuccess(false); }}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${stratMode === mode ? "bg-omn-primary text-white" : "bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading"}`}>
                {STRATEGY_INFO[mode].name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Config */}
            <div className="bg-omn-surface border border-omn-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-omn-heading mb-1">{STRATEGY_INFO[stratMode].name}</h3>
              <p className="text-xs text-omn-text mb-4">{STRATEGY_INFO[stratMode].description}</p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-omn-text block mb-1">Underlying</label>
                  <select value={stratSymbol} onChange={(e) => setStratSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary">
                    {optionableSymbols.map((s) => <option key={s} value={s}>{s} — ${getPrice(s).price.toFixed(2)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-omn-text block mb-1">Expiration</label>
                  <div className="flex gap-1 flex-wrap">
                    {expirations.map((exp) => (
                      <button key={exp} onClick={() => setStratExpiry(exp)}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${stratExpiry === exp ? "bg-omn-primary text-white" : "bg-omn-bg border border-omn-border text-omn-text"}`}>
                        {new Date(exp + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </button>
                    ))}
                  </div>
                </div>

                {stratMode === "vertical" && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-omn-text block mb-1">Direction</label>
                      <div className="flex gap-1 bg-omn-bg rounded p-0.5">
                        <button onClick={() => setStratDirection("bull")} className={`flex-1 py-1.5 rounded text-xs ${stratDirection === "bull" ? "bg-omn-success text-white" : "text-omn-text"}`}>Bull</button>
                        <button onClick={() => setStratDirection("bear")} className={`flex-1 py-1.5 rounded text-xs ${stratDirection === "bear" ? "bg-omn-danger text-white" : "text-omn-text"}`}>Bear</button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-omn-text block mb-1">Type</label>
                      <div className="flex gap-1 bg-omn-bg rounded p-0.5">
                        <button onClick={() => setStratLegType("call")} className={`flex-1 py-1.5 rounded text-xs ${stratLegType === "call" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Call</button>
                        <button onClick={() => setStratLegType("put")} className={`flex-1 py-1.5 rounded text-xs ${stratLegType === "put" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Put</button>
                      </div>
                    </div>
                  </div>
                )}

                {stratMode === "butterfly" && (
                  <div>
                    <label className="text-xs text-omn-text block mb-1">Type</label>
                    <div className="flex gap-1 bg-omn-bg rounded p-0.5">
                      <button onClick={() => setStratLegType("call")} className={`flex-1 py-1.5 rounded text-xs ${stratLegType === "call" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Call</button>
                      <button onClick={() => setStratLegType("put")} className={`flex-1 py-1.5 rounded text-xs ${stratLegType === "put" ? "bg-omn-primary text-white" : "text-omn-text"}`}>Put</button>
                    </div>
                  </div>
                )}

                {stratMode === "covered_call" && (
                  <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-lg p-3">
                    <p className="text-xs text-omn-accent">Requires 100 shares of {stratSymbol} per contract. You own: {holdings.find((h) => h.symbol === stratSymbol)?.shares ?? 0} shares.</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-omn-text block mb-1">Contracts</label>
                  <input type="number" value={stratContracts} onChange={(e) => setStratContracts(e.target.value)} placeholder="1" min="1" step="1"
                    className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary" />
                </div>
              </div>
            </div>

            {/* Legs + Metrics */}
            <div className="space-y-4">
              {/* Legs Table */}
              <div className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-omn-border">
                  <h3 className="text-sm font-semibold text-omn-heading">Legs ({stratLegs.length})</h3>
                </div>
                {stratLegs.map((leg, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-omn-border/30 text-xs">
                    <span className={`px-2 py-0.5 rounded font-medium ${leg.action === "buy" ? "bg-omn-success/20 text-omn-success" : "bg-omn-danger/20 text-omn-danger"}`}>
                      {leg.action.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${leg.type === "call" ? "bg-omn-primary/20 text-omn-primary" : "bg-omn-accent/20 text-omn-accent"}`}>
                      {leg.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-omn-heading font-bold">${leg.strike.toFixed(0)}</span>
                    <span className="ml-auto font-mono text-omn-heading">${leg.price.toFixed(2)}</span>
                    <span className="text-omn-text">x {stratContractsN || 1}</span>
                  </div>
                ))}
              </div>

              {/* Strategy Metrics */}
              {stratMetrics && stratContractsN > 0 && (
                <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-omn-heading mb-3">Strategy Metrics</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-omn-bg rounded-lg p-2.5">
                      <p className="text-omn-text mb-0.5">Net {stratMetrics.netCost > 0 ? "Debit" : "Credit"}</p>
                      <p className={`font-mono font-bold ${stratMetrics.netCost > 0 ? "text-omn-danger" : "text-omn-success"}`}>${Math.abs(stratMetrics.netCost).toFixed(2)}</p>
                    </div>
                    <div className="bg-omn-bg rounded-lg p-2.5">
                      <p className="text-omn-text mb-0.5">Max Profit</p>
                      <p className="font-mono font-bold text-omn-success">{stratMetrics.maxProfit}</p>
                    </div>
                    <div className="bg-omn-bg rounded-lg p-2.5">
                      <p className="text-omn-text mb-0.5">Max Loss</p>
                      <p className="font-mono font-bold text-omn-danger">{stratMetrics.maxLoss}</p>
                    </div>
                    <div className="bg-omn-bg rounded-lg p-2.5">
                      <p className="text-omn-text mb-0.5">Breakeven(s)</p>
                      <p className="font-mono font-bold text-omn-heading">{stratMetrics.breakevens.join(", ") || "—"}</p>
                    </div>
                  </div>

                  {stratMetrics.netCost > 0 && stratMetrics.netCost > cashBalance && (
                    <div className="mt-3 bg-omn-bg rounded-lg p-3">
                      <p className="text-xs font-medium text-omn-heading mb-2">Fund from</p>
                      {fundingSources.length === 0 ? (
                        <p className="text-xs text-omn-danger">No payment methods connected.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {fundingSources.map((fs) => (
                            <button key={fs.id} onClick={() => setSelectedFundingId(fs.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${selectedFundingId === fs.id ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"}`}>
                              <div className={`w-6 h-6 ${fs.color} rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>{fs.icon}</div>
                              <span className="text-xs text-omn-heading flex-1">{fundingLabel(fs)}</span>
                              {selectedFundingId === fs.id && <span className="text-omn-primary text-xs">{"\u2713"}</span>}
                            </button>
                          ))}
                          <p className="text-[10px] text-omn-text">${(stratMetrics.netCost - cashBalance).toFixed(2)} needed from {selectedFunding ? fundingLabel(selectedFunding) : "..."}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {stratSuccess && (
                    <div className="bg-omn-success/10 border border-omn-success/30 rounded-lg p-3 mt-3 text-center">
                      <p className="text-sm text-omn-success font-medium">Strategy order filled!</p>
                    </div>
                  )}

                  {!stratConfirm ? (
                    <button onClick={() => setStratConfirm(true)}
                      disabled={stratContractsN <= 0 || (stratMetrics.netCost > 0 && stratMetrics.netCost > cashBalance && !selectedFunding) || (stratMode === "covered_call" && (holdings.find((h) => h.symbol === stratSymbol)?.shares ?? 0) < stratContractsN * 100)}
                      className="w-full mt-3 py-3 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      Review {STRATEGY_INFO[stratMode].name}
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="bg-omn-bg rounded-lg p-3 text-xs">
                        <p className="text-omn-heading font-medium">{STRATEGY_INFO[stratMode].name}: {stratSymbol}</p>
                        {stratLegs.map((l, i) => (
                          <p key={i} className="text-omn-text">{l.action.toUpperCase()} {l.type.toUpperCase()} ${l.strike} @ ${l.price.toFixed(2)}</p>
                        ))}
                        <p className="text-omn-accent font-mono mt-1">{stratMetrics.netCost > 0 ? "Debit" : "Credit"}: ${Math.abs(stratMetrics.netCost).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setStratConfirm(false)} className="flex-1 py-2.5 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text">Cancel</button>
                        <button onClick={placeStrategyOrder} className="flex-1 py-2.5 bg-omn-primary text-white rounded-lg text-sm font-medium">Confirm Order</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ORDERS ═══ */}
      {subTab === "orders" && (
        <div className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden">
          <div className="flex gap-1 px-4 py-3 border-b border-omn-border">
            {([["all", "All"], ["pending", "Pending"], ["filled", "Filled"], ["cancelled", "Cancelled"]] as [typeof orderFilter, string][]).map(([val, lbl]) => (
              <button key={val} onClick={() => setOrderFilter(val)} className={`px-3 py-1 rounded-lg text-xs font-medium ${orderFilter === val ? "bg-omn-primary text-white" : "text-omn-text hover:text-omn-heading"}`}>{lbl}</button>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-[auto_auto_auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-2 text-[10px] text-omn-text uppercase tracking-wide border-b border-omn-border/50">
            <span>ID</span><span>Date</span><span>Side</span><span>Description</span><span className="text-right">Qty</span><span className="text-right">Price</span><span>Type</span><span>Status</span>
          </div>
          {filteredOrders.map((o) => (
            <div key={o.id} className="grid grid-cols-[auto_auto_auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-omn-border/20 items-center text-xs hover:bg-omn-bg/50">
              <span className="font-mono text-omn-text">#{o.id}</span>
              <span className="text-omn-text">{o.date}</span>
              <span className={`font-medium ${o.action === "buy" ? "text-omn-success" : "text-omn-danger"}`}>{o.action.toUpperCase()}</span>
              <span className="text-omn-heading truncate">{o.description}</span>
              <span className="font-mono text-omn-heading text-right">{o.quantity}</span>
              <span className="font-mono text-omn-heading text-right">${o.filledPrice?.toFixed(2) ?? o.price.toFixed(2)}</span>
              <span className="text-omn-text">{o.orderType}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  o.status === "filled" ? "bg-omn-success/20 text-omn-success" : o.status === "pending" ? "bg-omn-accent/20 text-omn-accent" : "bg-omn-text/10 text-omn-text"
                }`}>{o.status}</span>
                {o.status === "pending" && <button onClick={() => cancelOrder(o.id)} className="text-omn-danger hover:text-omn-danger/80 text-[10px]">Cancel</button>}
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && <p className="px-4 py-8 text-center text-sm text-omn-text">No {orderFilter === "all" ? "" : orderFilter} orders</p>}
        </div>
      )}
    </div>
  );
}
