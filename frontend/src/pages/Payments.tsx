import { useState, useEffect } from "react";
import { sandboxPaymentMethods, type PaymentMethod } from "../data/sandbox-payments";
import { usePersistedState } from "../hooks/usePersistedState";
import {
  hasWallet,
  getAddress,
  getNativeBalances,
  CHAIN_META,
  type ChainBalance,
} from "../wallet";
import { pushActivity } from "../activity";
import { fetchCryptoPrices, CHAIN_NATIVE_SYMBOL, type CryptoPrice } from "../api/crypto-prices";
import { getTokenBalances, type TokenBalance } from "../api/token-balances";
import {
  getBankAccounts,
  clearBankAccounts,
  type PlaidAccount,
} from "../api/plaid";
import PlaidLink from "../components/PlaidLink";

// Demo user: Henry Thompson
const demoSSN = "890-12-3456";
const allPaymentMethods = sandboxPaymentMethods[demoSSN] ?? [];

// Available methods that can be connected (not pre-connected)
const connectableWallets: { id: string; type: string; label: string; icon: string; color: string }[] = [
  { id: "connect-apple-pay", type: "apple_pay", label: "Apple Pay", icon: "AP", color: "bg-gray-900" },
  { id: "connect-google-wallet", type: "google_wallet", label: "Google Wallet", icon: "GW", color: "bg-blue-600" },
  { id: "connect-samsung-pay", type: "samsung_pay", label: "Samsung Pay", icon: "SP", color: "bg-blue-800" },
];

const connectableCards: { id: string; label: string; last4: string; icon: string; color: string }[] = [
  { id: "connect-visa", label: "Add Visa Card", last4: "", icon: "CC", color: "bg-slate-600" },
  { id: "connect-mastercard", label: "Add Mastercard", last4: "", icon: "CC", color: "bg-red-600" },
  { id: "connect-amex", label: "Add Amex", last4: "", icon: "CC", color: "bg-blue-500" },
];

// Crypto trading pairs
const tradingPairs = [
  { from: "USDC", to: "ETH", price: 0.000385, change: +2.4 },
  { from: "USDC", to: "BTC", price: 0.0000121, change: +1.8 },
  { from: "ETH", to: "USDC", price: 2598.42, change: -2.4 },
  { from: "ETH", to: "BTC", price: 0.0314, change: -0.6 },
  { from: "USDC", to: "SOL", price: 0.00654, change: +5.1 },
  { from: "USDC", to: "MATIC", price: 1.587, change: -1.2 },
];

// Virtual card state
const virtualCard = {
  number: "4532 8012 3456 7890",
  expiry: "09/28",
  cvv: "412",
  name: "HENRY THOMPSON",
  registered: true,
};

// Demo merchants for card-only scenario
const cardOnlyMerchants = [
  { name: "Costco Gas Station", amount: 52.37, category: "Gas" },
  { name: "Joe's Pizza", amount: 18.50, category: "Food" },
  { name: "DMV Filing Fee", amount: 35.00, category: "Government" },
];

// Demo merchants for OmnID Pay
const omnidPayMerchants = [
  { name: "Amazon", amount: 89.99, category: "Shopping" },
  { name: "Uber Eats", amount: 24.50, category: "Food Delivery" },
  { name: "Spotify Premium", amount: 10.99, category: "Subscription" },
];

interface BridgeHistoryEntry {
  id: number;
  merchant: string;
  amount: number;
  fee: number;
  method: string;
  date: string;
  bankStatement: string;
}

type CardOnlyStep = "idle" | "detected" | "paying" | "done";
type OmnidPayStep = "idle" | "checkout" | "paying" | "done";
type ConnectStep = "idle" | "selecting" | "connecting" | "done";
type TradeStep = "idle" | "configure" | "confirming" | "done";

export default function Payments() {
  // Connected payment methods (persisted)
  const [connectedMethods, setConnectedMethods] = usePersistedState<PaymentMethod[]>("pay-methods", []);
  const [connectedWalletIds, setConnectedWalletIds] = usePersistedState<string[]>("pay-wallet-ids", []);
  const [connectedCardIds, setConnectedCardIds] = usePersistedState<string[]>("pay-card-ids", []);

  // Connect wallet flow
  const [connectStep, setConnectStep] = useState<ConnectStep>("idle");
  const [connectingItem, setConnectingItem] = useState<string>("");
  const [connectingIsCard, setConnectingIsCard] = useState(false);

  // Card-only bridging state
  const [cardOnlyStep, setCardOnlyStep] = useState<CardOnlyStep>("idle");
  const [selectedMerchant, setSelectedMerchant] = useState(cardOnlyMerchants[0]);
  const [showCardDetails, setShowCardDetails] = useState(false);

  // OmnID Pay checkout state
  const [omnidPayStep, setOmnidPayStep] = useState<OmnidPayStep>("idle");
  const [omnidMerchant, setOmnidMerchant] = useState(omnidPayMerchants[0]);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  // Custom card entry
  const [showCustomCard, setShowCustomCard] = useState(false);
  const [customCardNumber, setCustomCardNumber] = useState("");
  const [customCardName, setCustomCardName] = useState("");
  const [customCardExpiry, setCustomCardExpiry] = useState("");

  // Virtual card default funding source (persisted)
  const [defaultFundingId, setDefaultFundingId] = usePersistedState<string | null>("pay-default-funding", null);

  // Card-only payment choice: "own_card" or "virtual"
  const [cardOnlyChoice, setCardOnlyChoice] = useState<"own_card" | "virtual" | null>(null);
  const [selectedOwnCardId, setSelectedOwnCardId] = useState<string | null>(null);

  // Payment history (persisted — real events)
  const [bridgeHistory, setBridgeHistory] = usePersistedState<BridgeHistoryEntry[]>("pay-history", []);

  // Trade state
  const [tradeStep, setTradeStep] = useState<TradeStep>("idle");
  const [tradeFrom, setTradeFrom] = useState("USDC");
  const [tradeTo, setTradeTo] = useState("ETH");
  const [tradeAmount, setTradeAmount] = useState("");

  // Plaid bank accounts
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>(getBankAccounts);
  const [plaidModalOpen, setPlaidModalOpen] = useState(false);

  // Real wallet balances
  const [chainBalances, setChainBalances] = useState<Record<number, ChainBalance>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>({});
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const walletAddress = hasWallet() ? getAddress() : null;

  useEffect(() => {
    if (!walletAddress) return;
    setLoadingBalances(true);
    Promise.all([
      getNativeBalances(walletAddress),
      fetchCryptoPrices(["ETH", "POL", "AVAX", "BNB", "USDC", "USDT", "DAI"]),
      getTokenBalances(walletAddress),
    ]).then(([balances, prices, tokens]) => {
      setChainBalances(balances);
      setCryptoPrices(prices);
      setTokenBalances(tokens);
      setLoadingBalances(false);
    });
  }, [walletAddress]);

  // Build crypto PaymentMethod entries from real chain balances
  const crypto: PaymentMethod[] = walletAddress
    ? Object.entries(chainBalances)
        .filter(([, bal]) => bal.balance > 0n)
        .map(([chainIdStr, bal]) => {
          const chainId = Number(chainIdStr);
          const meta = CHAIN_META[chainId] ?? { name: `Chain ${chainId}`, icon: "?", color: "bg-gray-600" };
          return {
            id: `chain-${chainId}`,
            type: "crypto" as const,
            label: `${meta.name} Balance`,
            cryptoBalance: Number(bal.formatted),
            cryptoSymbol: bal.symbol,
            icon: meta.icon.slice(0, 2),
            color: meta.color,
          };
        })
    : [];

  // If wallet exists but no non-zero balances, show all chains at 0
  const cryptoDisplay: PaymentMethod[] = walletAddress && crypto.length === 0 && !loadingBalances
    ? Object.entries(CHAIN_META).map(([chainIdStr, meta]) => ({
        id: `chain-${chainIdStr}`,
        type: "crypto" as const,
        label: `${meta.name} Balance`,
        cryptoBalance: 0,
        cryptoSymbol: chainBalances[Number(chainIdStr)]?.symbol ?? meta.icon,
        icon: meta.icon.slice(0, 2),
        color: meta.color,
      }))
    : crypto;

  // Derived
  const wallets = connectedMethods.filter((m) => m.type === "apple_pay" || m.type === "google_wallet");
  const cards = connectedMethods.filter((m) => m.type === "credit_card");
  const paymentMethods = [...connectedMethods, ...cryptoDisplay];

  // All possible funding sources for the virtual card (wallets + cards + crypto)
  const fundingSources = paymentMethods;
  const defaultFundingSource = fundingSources.find((m) => m.id === defaultFundingId) ?? null;

  function handleConnectWallet(item: typeof connectableWallets[0]) {
    setConnectingItem(item.label);
    setConnectingIsCard(false);
    setConnectStep("connecting");
    setTimeout(() => {
      const matchingMethod = allPaymentMethods.find((m) => m.type === item.type);
      if (matchingMethod) {
        setConnectedMethods((prev) => [...prev, matchingMethod]);
      } else {
        setConnectedMethods((prev) => [...prev, {
          id: item.id,
          type: item.type as PaymentMethod["type"],
          label: item.label,
          icon: item.icon,
          color: item.color,
        }]);
      }
      setConnectedWalletIds((prev) => [...prev, item.id]);
      pushActivity(`Connected ${item.label}`, item.icon, item.color);
      setConnectStep("done");
    }, 1500);
  }

  function formatCardNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function handleCustomCardSubmit() {
    const digits = customCardNumber.replace(/\D/g, "");
    if (digits.length < 13) return;
    const last4 = digits.slice(-4);
    const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : digits.startsWith("3") ? "Amex" : "Card";
    const id = `custom-${Date.now()}`;
    setConnectedMethods((prev) => [...prev, {
      id,
      type: "credit_card",
      label: `${brand} ending in ${last4}`,
      last4,
      icon: "CC",
      color: brand === "Visa" ? "bg-blue-600" : brand === "Mastercard" ? "bg-red-600" : brand === "Amex" ? "bg-blue-500" : "bg-slate-600",
    }]);
    setCustomCardNumber("");
    setCustomCardName("");
    setCustomCardExpiry("");
    setShowCustomCard(false);
    setConnectingItem(`${brand} ending in ${last4}`);
    setConnectingIsCard(true);
    setConnectStep("done");
  }

  function handleConnectCard(item: typeof connectableCards[0]) {
    setConnectingItem(item.label);
    setConnectingIsCard(true);
    setConnectStep("connecting");
    setTimeout(() => {
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      setConnectedMethods((prev) => [...prev, {
        id: item.id,
        type: "credit_card",
        label: `${item.label.replace("Add ", "")} ending in ${last4}`,
        last4,
        icon: item.icon,
        color: item.color,
      }]);
      setConnectedCardIds((prev) => [...prev, item.id]);
      setConnectStep("done");
    }, 1500);
  }

  function handleTrade() {
    setTradeStep("confirming");
    setTimeout(() => {
      pushActivity(`Traded ${tradeAmount} ${tradeFrom} → ${tradeTo}`, "TX", "bg-amber-600");
      setTradeStep("done");
    }, 1500);
  }

  function handlePlaidSuccess(accounts: PlaidAccount[]) {
    setPlaidAccounts(getBankAccounts());
    // Also add linked bank accounts as funding sources (PaymentMethod entries)
    const bankMethods: PaymentMethod[] = accounts
      .filter((a) => a.type === "depository")
      .map((a) => ({
        id: `plaid-${a.account_id}`,
        type: "apple_pay" as const, // re-use wallet type so it shows up as a funding source
        label: `${a.name} ${a.mask ? `****${a.mask}` : ""}`,
        balance: a.balances.current ?? 0,
        icon: "BK",
        color: "bg-emerald-600",
      }));
    setConnectedMethods((prev) => {
      // Remove any existing plaid entries for these accounts, then add new
      const newIds = new Set(accounts.map((a) => `plaid-${a.account_id}`));
      const filtered = prev.filter((m) => !newIds.has(m.id));
      return [...filtered, ...bankMethods];
    });
    const accountName = accounts[0]?.name ?? "Bank";
    pushActivity(`Linked ${accountName} via Plaid`, "BK", "bg-emerald-600");
  }

  function handleUnlinkBank(accountId: string) {
    const account = plaidAccounts.find((a) => a.account_id === accountId);
    // Remove from localStorage
    const remaining = plaidAccounts.filter((a) => a.account_id !== accountId);
    if (remaining.length === 0) {
      clearBankAccounts();
    } else {
      localStorage.setItem("omnid-bank-accounts", JSON.stringify(remaining));
    }
    setPlaidAccounts(remaining);
    // Remove from connected methods
    setConnectedMethods((prev) => prev.filter((m) => m.id !== `plaid-${accountId}`));
    if (account) {
      pushActivity(`Unlinked ${account.name}`, "BK", "bg-red-600");
    }
  }

  const currentPair = tradingPairs.find((p) => p.from === tradeFrom && p.to === tradeTo);
  const tradeEstimate = currentPair && tradeAmount ? (Number(tradeAmount) * currentPair.price).toFixed(6) : "0";

  function handleCardOnlyDetect(merchant: typeof cardOnlyMerchants[0]) {
    setSelectedMerchant(merchant);
    setCardOnlyChoice(null);
    setSelectedOwnCardId(null);
    setCardOnlyStep("detected");
  }

  function handleCardOnlyPay() {
    setCardOnlyStep("paying");
    setTimeout(() => {
      const method = cardOnlyChoice === "virtual" ? "Virtual Visa" : "Own Card";
      setBridgeHistory((prev) => [{
        id: Date.now(),
        merchant: selectedMerchant.name,
        amount: selectedMerchant.amount,
        fee: cardOnlyChoice === "virtual" ? selectedMerchant.amount * 0.005 : 0,
        method,
        date: new Date().toISOString().slice(0, 10),
        bankStatement: selectedMerchant.name.toUpperCase().replace(/[^A-Z0-9 ]/g, ""),
      }, ...prev]);
      pushActivity(`Payment: $${selectedMerchant.amount.toFixed(2)} at ${selectedMerchant.name}`, "CC", "bg-slate-600");
      setCardOnlyStep("done");
    }, 1500);
  }

  function handleOmnidPayStart(merchant: typeof omnidPayMerchants[0]) {
    setOmnidMerchant(merchant);
    setSplitEnabled(false);
    setSplitAmounts({});
    setSelectedPaymentIds([]);
    setOmnidPayStep("checkout");
  }

  function togglePaymentMethod(id: string) {
    setSelectedPaymentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleOmnidPayConfirm() {
    setOmnidPayStep("paying");
    setTimeout(() => {
      const methodLabel = splitEnabled ? `Split (${selectedPaymentIds.length} methods)` : "OmnID Pay";
      setBridgeHistory((prev) => [{
        id: Date.now(),
        merchant: omnidMerchant.name,
        amount: omnidMerchant.amount,
        fee: 0,
        method: methodLabel,
        date: new Date().toISOString().slice(0, 10),
        bankStatement: omnidMerchant.name.toUpperCase(),
      }, ...prev]);
      pushActivity(`OmnID Pay: $${omnidMerchant.amount.toFixed(2)} at ${omnidMerchant.name}`, "OP", "bg-cyan-600");
      setOmnidPayStep("done");
    }, 1500);
  }

  const totalSplit = Object.values(splitAmounts).reduce((a, b) => a + b, 0);
  const remaining = omnidMerchant.amount - totalSplit;

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Payments</h1>
      <p className="text-omn-text mb-8">
        Virtual card, smart checkout, and split payments across any method
      </p>

      {/* ═══ BANK ACCOUNTS (Plaid) ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-omn-heading">Bank Accounts</h2>
            <p className="text-sm text-omn-text">
              Link your bank accounts to fund purchases and investments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-omn-text bg-omn-bg px-2.5 py-1 rounded-full border border-omn-border">
              <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Powered by Plaid
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Sandbox</span>
          </div>
        </div>

        {/* Linked accounts */}
        {plaidAccounts.length > 0 && (
          <div className="space-y-2 mb-4">
            {plaidAccounts.map((acc) => (
              <div key={acc.account_id} className="flex items-center gap-3 p-4 bg-omn-bg rounded-xl border border-omn-border">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {acc.type === "depository" ? "BK" : acc.type === "credit" ? "CC" : "AC"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-omn-heading truncate">{acc.name}</p>
                  <p className="text-xs text-omn-text capitalize">
                    {acc.subtype ?? acc.type} {acc.mask ? `\u00B7 ****${acc.mask}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <p className="text-sm font-mono text-omn-accent">
                    {acc.balances.current != null
                      ? `$${acc.balances.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "--"}
                  </p>
                  <p className="text-[10px] text-omn-text">{acc.balances.currency}</p>
                </div>
                <button
                  onClick={() => handleUnlinkBank(acc.account_id)}
                  className="text-xs px-3 py-1 bg-omn-surface border border-omn-border rounded-lg text-omn-text hover:text-omn-danger hover:border-omn-danger/50 transition-colors shrink-0"
                >
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Link Bank Account button */}
        <button
          onClick={() => setPlaidModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-omn-primary/40 rounded-xl hover:border-omn-primary hover:bg-omn-primary/5 transition-colors text-omn-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium">Link Bank Account</span>
        </button>

        {plaidAccounts.length === 0 && (
          <p className="text-xs text-omn-text text-center mt-3">
            Securely connect your checking, savings, or credit card accounts. Your credentials are never stored.
          </p>
        )}
      </div>

      {/* Plaid Link Modal */}
      <PlaidLink
        isOpen={plaidModalOpen}
        onClose={() => setPlaidModalOpen(false)}
        onSuccess={handlePlaidSuccess}
      />

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Digital Wallets */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-omn-heading mb-3">
            Digital Wallets
          </h2>
          <div className="space-y-2">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg">
                <div className={`w-9 h-9 ${w.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {w.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-omn-heading">
                    {w.type === "apple_pay" ? "Apple Pay" : "Google Wallet"}
                  </p>
                  <p className="text-xs text-omn-text">{w.label}</p>
                </div>
                <div className="text-right">
                  {w.balance != null && (
                    <p className="text-sm font-mono text-omn-accent">${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  )}
                  <span className="text-xs text-omn-success">{"\u2713"}</span>
                </div>
              </div>
            ))}
            {/* Connect buttons for unconnected wallets */}
            {connectableWallets.filter((w) => !connectedWalletIds.includes(w.id)).map((w) => (
              <button
                key={w.id}
                onClick={() => handleConnectWallet(w)}
                className="w-full flex items-center gap-3 p-3 border border-dashed border-omn-border rounded-lg hover:border-omn-primary transition-colors text-left"
              >
                <div className={`w-9 h-9 ${w.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-50`}>
                  {w.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-omn-text">{w.label}</p>
                  <p className="text-xs text-omn-text">Tap to connect</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Connect</span>
              </button>
            ))}
          </div>
        </div>

        {/* Credit Cards */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-omn-heading mb-3">
            Credit Cards
          </h2>
          <div className="space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg">
                <div className={`w-9 h-9 ${c.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-omn-heading">{c.label}</p>
                  {c.last4 && <p className="text-xs text-omn-text font-mono">**** {c.last4}</p>}
                </div>
                <div className="text-right">
                  {c.balance != null && (
                    <p className="text-sm font-mono text-omn-accent">${c.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  )}
                  <span className="text-xs text-omn-success">{"\u2713"}</span>
                </div>
              </div>
            ))}
            {/* Connect buttons for unconnected cards */}
            {connectableCards.filter((c) => !connectedCardIds.includes(c.id)).map((c) => (
              <button
                key={c.id}
                onClick={() => handleConnectCard(c)}
                className="w-full flex items-center gap-3 p-3 border border-dashed border-omn-border rounded-lg hover:border-omn-primary transition-colors text-left"
              >
                <div className={`w-9 h-9 ${c.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-50`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-omn-text">{c.label}</p>
                  <p className="text-xs text-omn-text">$0.20 KYC verification fee</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Add</span>
              </button>
            ))}
            {/* Add your own card */}
            {!showCustomCard ? (
              <button
                onClick={() => setShowCustomCard(true)}
                className="w-full flex items-center gap-3 p-3 border border-dashed border-omn-primary/30 rounded-lg hover:border-omn-primary transition-colors text-left bg-omn-primary/5"
              >
                <div className="w-9 h-9 bg-omn-primary/20 rounded-lg flex items-center justify-center text-omn-primary text-sm font-bold shrink-0">+</div>
                <div className="flex-1">
                  <p className="text-sm text-omn-primary font-medium">Enter Your Own Card</p>
                  <p className="text-xs text-omn-text">Add any Visa, Mastercard, or Amex · $0.20 KYC fee</p>
                </div>
              </button>
            ) : (
              <div className="p-3 bg-omn-bg border border-omn-border rounded-lg space-y-2">
                <p className="text-xs font-medium text-omn-heading">Add Credit/Debit Card</p>
                <input
                  type="text"
                  value={customCardNumber}
                  onChange={(e) => setCustomCardNumber(formatCardNumber(e.target.value))}
                  placeholder="Card number"
                  className="w-full px-3 py-1.5 bg-omn-surface border border-omn-border rounded text-omn-heading text-sm font-mono focus:border-omn-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={customCardName}
                  onChange={(e) => setCustomCardName(e.target.value.toUpperCase())}
                  placeholder="Name on card"
                  className="w-full px-3 py-1.5 bg-omn-surface border border-omn-border rounded text-omn-heading text-sm focus:border-omn-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={customCardExpiry}
                  onChange={(e) => setCustomCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-24 px-3 py-1.5 bg-omn-surface border border-omn-border rounded text-omn-heading text-sm font-mono focus:border-omn-primary focus:outline-none"
                />
                <p className="text-[10px] text-omn-accent">$0.20 KYC verification fee will be charged to verify card ownership.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowCustomCard(false)}
                    className="px-3 py-1 text-xs bg-omn-surface border border-omn-border rounded text-omn-text hover:text-omn-heading transition-colors"
                  >Cancel</button>
                  <button
                    onClick={handleCustomCardSubmit}
                    disabled={customCardNumber.replace(/\D/g, "").length < 13 || !customCardName || !customCardExpiry}
                    className="px-3 py-1 text-xs bg-omn-primary text-white rounded hover:bg-omn-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >Add Card · $0.20</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crypto (real wallet balances) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-omn-heading">
              Crypto Holdings
            </h2>
            {walletAddress && (
              <button
                onClick={() => {
                  setLoadingBalances(true);
                  Promise.all([
                    getNativeBalances(walletAddress),
                    fetchCryptoPrices(["ETH", "POL", "AVAX", "BNB", "USDC", "USDT", "DAI"]),
                    getTokenBalances(walletAddress),
                  ]).then(([b, p, t]) => {
                    setChainBalances(b);
                    setCryptoPrices(p);
                    setTokenBalances(t);
                    setLoadingBalances(false);
                  });
                }}
                className="text-[10px] px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full hover:bg-omn-primary/30 transition-colors"
              >
                {loadingBalances ? "..." : "Refresh"}
              </button>
            )}
          </div>
          {walletAddress ? (
            <>
              <p className="text-xs text-omn-text mb-1 font-mono truncate">{walletAddress}</p>
              <p className="text-[10px] text-omn-text mb-3">Live balances across 7 chains</p>
              {loadingBalances && cryptoDisplay.length === 0 ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-omn-primary border-t-transparent rounded-full" />
                  <span className="text-xs text-omn-text">Loading balances...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {cryptoDisplay.map((c) => {
                    const nativeSym = CHAIN_NATIVE_SYMBOL[Number(c.id.replace("chain-", ""))] ?? c.cryptoSymbol;
                    const usdPrice = cryptoPrices[nativeSym ?? ""]?.usd;
                    const usdValue = usdPrice && c.cryptoBalance ? c.cryptoBalance * usdPrice : null;
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg">
                        <div className={`w-9 h-9 ${c.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {c.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-omn-heading">{c.label}</p>
                          <p className="text-xs text-omn-accent font-mono">
                            {c.cryptoBalance?.toFixed(6)} {c.cryptoSymbol}
                          </p>
                        </div>
                        {usdValue != null && usdValue > 0 && (
                          <span className="text-xs font-mono text-omn-heading">${usdValue.toFixed(2)}</span>
                        )}
                      </div>
                    );
                  })}
                  {/* ERC-20 token balances */}
                  {tokenBalances.map((t) => (
                    <div key={`${t.symbol}-${t.chainId}`} className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg">
                      <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {t.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-omn-heading">{t.symbol} <span className="text-omn-text text-[10px]">({t.chainName})</span></p>
                        <p className="text-xs text-omn-accent font-mono">
                          {Number(t.formatted).toFixed(2)} {t.symbol}
                        </p>
                      </div>
                      {cryptoPrices[t.symbol]?.usd && (
                        <span className="text-xs font-mono text-omn-heading">
                          ${(Number(t.formatted) * cryptoPrices[t.symbol].usd).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-omn-text mb-2">No wallet connected</p>
              <a href="/trading" className="text-xs px-3 py-1 bg-omn-primary/20 text-omn-primary rounded-full hover:bg-omn-primary/30 transition-colors">
                Create Wallet in Trading
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ═══ CONNECTION MODAL ═══ */}
      {connectStep === "connecting" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-sm text-center">
            <div className="animate-spin w-10 h-10 border-3 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-omn-heading font-medium">Connecting {connectingItem}...</p>
            <p className="text-xs text-omn-text mt-1">
              {connectingIsCard ? "Running KYC verification and linking to OmnID" : "Verifying account and linking to OmnID"}
            </p>
            {connectingIsCard && <p className="text-xs text-omn-accent mt-1">$0.20 verification fee</p>}
          </div>
        </div>
      )}
      {connectStep === "done" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-sm text-center">
            <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-omn-heading font-medium">{connectingItem} Connected!</p>
            <p className="text-xs text-omn-text mt-1 mb-1">Now available for payments and bridging</p>
            {connectingIsCard && <p className="text-xs text-omn-accent mb-3">$0.20 KYC fee charged</p>}
            <button
              onClick={() => setConnectStep("idle")}
              className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ═══ VIRTUAL VISA CARD ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-omn-heading">OmnID Virtual Visa</h2>
            <p className="text-sm text-omn-text">
              A dedicated card for extra security. Use it as a business card while keeping your personal card separate — or vice versa.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full">Active</span>
            <span className="text-xs px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Free card</span>
            <span className="text-xs px-2 py-0.5 bg-omn-accent/20 text-omn-accent rounded-full">0.5% handling fee</span>
            <span className="text-xs px-2 py-0.5 bg-omn-pro/20 text-omn-pro rounded-full">CaaS via Marqeta</span>
          </div>
        </div>

        {/* Virtual Card Visual */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 max-w-md relative overflow-hidden mb-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-omn-primary/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-bold text-omn-heading">
              Omn<span className="text-omn-accent">ID</span>
            </span>
            <span className="text-xs text-omn-text">VIRTUAL</span>
          </div>
          <p className="text-lg font-mono text-omn-heading tracking-widest mb-4">
            {showCardDetails ? virtualCard.number : "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 7890"}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-omn-text mb-0.5">CARDHOLDER</p>
              <p className="text-sm text-omn-heading">{virtualCard.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-omn-text mb-0.5">EXPIRES</p>
              <p className="text-sm text-omn-heading">{showCardDetails ? virtualCard.expiry : "\u2022\u2022/\u2022\u2022"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-omn-text mb-0.5">CVV</p>
              <p className="text-sm text-omn-heading">{showCardDetails ? virtualCard.cvv : "\u2022\u2022\u2022"}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-400">VISA</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCardDetails(!showCardDetails)}
          className="text-xs px-3 py-1.5 bg-omn-bg border border-omn-border rounded-lg text-omn-text hover:text-omn-heading transition-colors"
        >
          {showCardDetails ? "Hide Card Details" : "Show Card Details"}
        </button>

        {/* Default Funding Source */}
        <div className="mt-4 bg-omn-bg rounded-lg p-4">
          <p className="text-xs font-medium text-omn-heading mb-2">Default Funding Source</p>
          <p className="text-xs text-omn-text mb-3">
            Choose which account is billed when you pay with the virtual card.
          </p>
          {fundingSources.length === 0 ? (
            <p className="text-xs text-omn-accent">Connect a wallet, card, or use crypto above to set a funding source.</p>
          ) : (
            <div className="space-y-1.5">
              {fundingSources.map((fs) => {
                const fsLabel =
                  fs.type === "apple_pay" ? "Apple Pay" :
                  fs.type === "google_wallet" ? "Google Wallet" :
                  fs.type === "crypto" ? fs.cryptoSymbol! :
                  fs.label;
                const fsBalance =
                  fs.type === "crypto"
                    ? (fs.cryptoSymbol === "USDC" ? `$${fs.cryptoBalance?.toLocaleString()}` : `${fs.cryptoBalance?.toFixed(4)} ETH`)
                    : fs.balance != null ? `$${fs.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
                const isDefault = defaultFundingId === fs.id;
                return (
                  <button
                    key={fs.id}
                    onClick={() => setDefaultFundingId(fs.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
                      isDefault ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"
                    }`}
                  >
                    <div className={`w-7 h-7 ${fs.color} rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                      {fs.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-omn-heading">{fsLabel}</p>
                      {fsBalance && <p className="text-[10px] text-omn-accent font-mono">{fsBalance}</p>}
                    </div>
                    {isDefault && <span className="text-xs px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Default</span>}
                  </button>
                );
              })}
            </div>
          )}
          {!defaultFundingSource && fundingSources.length > 0 && (
            <p className="text-xs text-omn-danger mt-2">Select a default funding source to use the virtual card.</p>
          )}
        </div>

        <div className="mt-4 bg-omn-bg rounded-lg p-3 space-y-2">
          <p className="text-xs text-omn-text">
            <strong className="text-omn-heading">How it works:</strong> Issued via a Card-as-a-Service API (Marqeta). When you tap at a store, the merchant pings Visa, Visa pings OmnID, and we instantly settle from your default funding source — including crypto-to-fiat conversion if needed. A <strong className="text-omn-accent">0.5% handling fee</strong> is applied per transaction. The merchant only sees a regular Visa transaction.
          </p>
          <p className="text-xs text-omn-text">
            <strong className="text-omn-heading">Security tip:</strong> Use the virtual card as a dedicated business card and keep your personal cards for everyday purchases — or the other way around. Separating spending gives you cleaner records and an extra layer of protection if either card is compromised.
          </p>
          <p className="text-xs text-omn-text">
            <strong className="text-omn-heading">Apple Pay:</strong> Add this card directly to your Apple Wallet via In-App Push Provisioning — tap to pay anywhere with your phone.
          </p>
        </div>
      </div>

      {/* ═══ CARD-ONLY BRIDGING DEMO ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">
          Card-Only Auto-Bridge
        </h2>
        <p className="text-sm text-omn-text mb-4">
          OmnID detects card-only merchants and automatically bridges your digital wallet payment through the virtual Visa.
        </p>

        {connectedMethods.length === 0 && cardOnlyStep === "idle" && (
          <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-lg p-4 text-center">
            <p className="text-sm text-omn-heading font-medium mb-1">No payment methods connected</p>
            <p className="text-xs text-omn-text">Connect a digital wallet or credit card above to use card-only bridging.</p>
          </div>
        )}

        {connectedMethods.length > 0 && cardOnlyStep === "idle" && (
          <div>
            <p className="text-xs text-omn-text mb-3">Try tapping at one of these card-only merchants:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cardOnlyMerchants.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleCardOnlyDetect(m)}
                  className="p-4 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-[10px] font-bold">!</span>
                    <span className="text-xs text-red-400">Card only</span>
                  </div>
                  <p className="text-sm font-medium text-omn-heading">{m.name}</p>
                  <p className="text-lg font-bold text-omn-accent font-mono">${m.amount.toFixed(2)}</p>
                  <p className="text-xs text-omn-text">{m.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {connectedMethods.length > 0 && cardOnlyStep === "detected" && (
          <div className="max-w-md">
            <div className="bg-omn-primary/10 border border-omn-primary/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 bg-omn-primary rounded-full flex items-center justify-center text-white text-xs">{"\u26A1"}</span>
                <span className="text-sm font-medium text-omn-heading">Card-only merchant detected</span>
              </div>
              <p className="text-xs text-omn-text">
                <strong className="text-omn-heading">{selectedMerchant.name}</strong> only accepts card payments.
                {cards.length > 0 ? " You can pay with your own card or use the OmnID Virtual Visa." : " OmnID will bridge through your Virtual Visa."}
              </p>
            </div>

            {/* Payment choice */}
            <div className="space-y-2 mb-4">
              {/* Option: Pay with own card (only if user has cards) */}
              {cards.length > 0 && (
                <button
                  onClick={() => { setCardOnlyChoice("own_card"); setSelectedOwnCardId(cards[0].id); }}
                  className={`w-full p-3 rounded-lg border transition-colors text-left ${
                    cardOnlyChoice === "own_card" ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">CC</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-omn-heading">Pay with your card</p>
                      <p className="text-xs text-omn-success">No fee</p>
                    </div>
                    {cardOnlyChoice === "own_card" && <span className="text-omn-primary text-sm">{"\u2713"}</span>}
                  </div>
                </button>
              )}

              {/* Option: Pay with Virtual Visa */}
              <button
                onClick={() => setCardOnlyChoice("virtual")}
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  cardOnlyChoice === "virtual" ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-blue-400 text-[10px] font-bold shrink-0">V</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-omn-heading">Pay with OmnID Virtual Visa</p>
                    <p className="text-xs text-omn-accent">0.5% handling fee · Billed to {defaultFundingSource ? (
                      defaultFundingSource.type === "apple_pay" ? "Apple Pay" :
                      defaultFundingSource.type === "google_wallet" ? "Google Wallet" :
                      defaultFundingSource.type === "crypto" ? defaultFundingSource.cryptoSymbol :
                      defaultFundingSource.label
                    ) : "—"}</p>
                  </div>
                  {cardOnlyChoice === "virtual" && <span className="text-omn-primary text-sm">{"\u2713"}</span>}
                </div>
              </button>
            </div>

            {/* Card selector when paying with own card */}
            {cardOnlyChoice === "own_card" && cards.length > 1 && (
              <div className="mb-4">
                <p className="text-xs text-omn-text mb-2">Select card:</p>
                <div className="space-y-1.5">
                  {cards.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedOwnCardId(c.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
                        selectedOwnCardId === c.id ? "border-omn-primary bg-omn-primary/5" : "border-omn-border hover:border-omn-primary/50"
                      }`}
                    >
                      <div className={`w-7 h-7 ${c.color} rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{c.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs text-omn-heading">{c.label}</p>
                        {c.balance != null && <p className="text-[10px] text-omn-accent font-mono">${c.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      </div>
                      {selectedOwnCardId === c.id && <span className="text-omn-primary text-xs">{"\u2713"}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Virtual Visa warning if no default funding source */}
            {cardOnlyChoice === "virtual" && !defaultFundingSource && (
              <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-omn-danger font-medium">No default funding source set</p>
                <p className="text-xs text-omn-text mt-0.5">Scroll up to the Virtual Visa section and select a default funding source before using the virtual card.</p>
              </div>
            )}

            {/* Order summary */}
            {cardOnlyChoice && (
              <div className="bg-omn-bg rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">Merchant</span>
                  <span className="text-omn-heading">{selectedMerchant.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">Amount</span>
                  <span className="text-omn-heading font-mono">${selectedMerchant.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">Paying with</span>
                  <span className="text-omn-heading">
                    {cardOnlyChoice === "own_card"
                      ? (cards.find((c) => c.id === selectedOwnCardId)?.label ?? "Card")
                      : "OmnID Virtual Visa ****7890"}
                  </span>
                </div>
                {cardOnlyChoice === "virtual" && defaultFundingSource && (
                  <div className="flex justify-between text-sm">
                    <span className="text-omn-text">Funded by</span>
                    <span className="text-omn-heading">
                      {defaultFundingSource.type === "apple_pay" ? "Apple Pay" :
                       defaultFundingSource.type === "google_wallet" ? "Google Wallet" :
                       defaultFundingSource.type === "crypto" ? defaultFundingSource.cryptoSymbol :
                       defaultFundingSource.label}
                    </span>
                  </div>
                )}
                {cardOnlyChoice === "virtual" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-omn-text">Handling fee (0.5%)</span>
                    <span className="text-omn-accent font-mono">${(selectedMerchant.amount * 0.005).toFixed(2)}</span>
                  </div>
                )}
                {cardOnlyChoice === "own_card" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-omn-text">Fee</span>
                    <span className="text-omn-success">$0.00</span>
                  </div>
                )}
                <div className="border-t border-omn-border pt-2 flex justify-between text-sm font-medium">
                  <span className="text-omn-heading">Total</span>
                  <span className="text-omn-heading font-mono">
                    ${cardOnlyChoice === "virtual"
                      ? (selectedMerchant.amount * 1.005).toFixed(2)
                      : selectedMerchant.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCardOnlyStep("idle")}
                className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCardOnlyPay}
                disabled={!cardOnlyChoice || (cardOnlyChoice === "virtual" && !defaultFundingSource)}
                className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay ${cardOnlyChoice === "virtual"
                  ? (selectedMerchant.amount * 1.005).toFixed(2)
                  : selectedMerchant.amount.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {cardOnlyStep === "paying" && (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-omn-heading">
              {cardOnlyChoice === "own_card" ? "Processing card payment..." : "Processing via Virtual Visa..."}
            </p>
            <p className="text-xs text-omn-text mt-1">
              {cardOnlyChoice === "own_card"
                ? `${cards.find((c) => c.id === selectedOwnCardId)?.label ?? "Card"} → ${selectedMerchant.name}`
                : `${defaultFundingSource ? (
                    defaultFundingSource.type === "apple_pay" ? "Apple Pay" :
                    defaultFundingSource.type === "google_wallet" ? "Google Wallet" :
                    defaultFundingSource.type === "crypto" ? defaultFundingSource.cryptoSymbol :
                    defaultFundingSource.label
                  ) : "Funding source"} → OmnID Virtual Visa → ${selectedMerchant.name}`}
            </p>
          </div>
        )}

        {cardOnlyStep === "done" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-omn-heading font-medium mb-1">Payment Complete</p>
            <p className="text-sm text-omn-text mb-1">
              {cardOnlyChoice === "own_card"
                ? `$${selectedMerchant.amount.toFixed(2)} paid to ${selectedMerchant.name} via ${cards.find((c) => c.id === selectedOwnCardId)?.label ?? "card"}`
                : `$${selectedMerchant.amount.toFixed(2)} + $${(selectedMerchant.amount * 0.005).toFixed(2)} fee paid to ${selectedMerchant.name} via Virtual Visa`}
            </p>
            <p className="text-xs text-omn-accent mb-4">
              Bank statement: "{selectedMerchant.name.toUpperCase().replace(/[^A-Z0-9 ]/g, "")}"
            </p>
            <button
              onClick={() => setCardOnlyStep("idle")}
              className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ═══ OMNID PAY CHECKOUT ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">
          OmnID Pay Checkout
        </h2>
        <p className="text-sm text-omn-text mb-4">
          Merchants that support OmnID Pay let you choose how to pay — and split across multiple methods.
        </p>

        {paymentMethods.length === 0 && omnidPayStep === "idle" && (
          <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-lg p-4 text-center">
            <p className="text-sm text-omn-heading font-medium mb-1">No payment methods available</p>
            <p className="text-xs text-omn-text">Connect a wallet, card, or fund your crypto wallet to use OmnID Pay.</p>
          </div>
        )}

        {paymentMethods.length > 0 && omnidPayStep === "idle" && (
          <div>
            <p className="text-xs text-omn-text mb-3">Try checking out at one of these OmnID Pay merchants:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {omnidPayMerchants.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleOmnidPayStart(m)}
                  className="p-4 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-omn-heading">
                      Omn<span className="text-omn-accent">ID</span>
                    </span>
                    <span className="text-xs text-omn-success">Pay</span>
                  </div>
                  <p className="text-sm font-medium text-omn-heading">{m.name}</p>
                  <p className="text-lg font-bold text-omn-accent font-mono">${m.amount.toFixed(2)}</p>
                  <p className="text-xs text-omn-text">{m.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {omnidPayStep === "checkout" && (
          <div className="max-w-lg">
            {/* Checkout header */}
            <div className="bg-omn-bg rounded-t-xl p-4 border border-omn-border border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-omn-text">Paying</p>
                  <p className="text-sm font-medium text-omn-heading">{omnidMerchant.name}</p>
                </div>
                <p className="text-2xl font-bold text-omn-accent font-mono">${omnidMerchant.amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Split toggle */}
            <div className="bg-omn-bg border border-omn-border p-4 border-b-0">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={splitEnabled}
                  onChange={() => {
                    setSplitEnabled(!splitEnabled);
                    setSplitAmounts({});
                    setSelectedPaymentIds([]);
                  }}
                  className="w-4 h-4 rounded border-omn-border accent-omn-primary"
                />
                <div>
                  <span className="text-sm text-omn-heading">Split across multiple payment methods</span>
                  <p className="text-xs text-omn-text">Choose how much to pay from each source</p>
                </div>
              </label>
            </div>

            {/* Payment methods */}
            <div className="bg-omn-bg border border-omn-border rounded-b-xl p-4">
              <p className="text-xs text-omn-text mb-3">
                {splitEnabled ? "Select methods and enter amounts:" : "Select a payment method:"}
              </p>
              <div className="space-y-2">
                {paymentMethods.map((pm) => {
                  const isSelected = selectedPaymentIds.includes(pm.id);
                  const pmLabel =
                    pm.type === "apple_pay" ? `Apple Pay` :
                    pm.type === "google_wallet" ? `Google Wallet` :
                    pm.type === "crypto" ? `${pm.cryptoSymbol}` :
                    pm.label;
                  const pmBalance =
                    pm.type === "crypto"
                      ? (pm.cryptoSymbol === "USDC" ? `$${pm.cryptoBalance?.toLocaleString()}` : `${pm.cryptoBalance?.toFixed(4)} ETH`)
                      : pm.balance != null ? `$${pm.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

                  return (
                    <div key={pm.id}>
                      <button
                        onClick={() => {
                          if (splitEnabled) {
                            togglePaymentMethod(pm.id);
                          } else {
                            setSelectedPaymentIds([pm.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          isSelected
                            ? "border-omn-primary bg-omn-primary/5"
                            : "border-omn-border hover:border-omn-primary/50"
                        }`}
                      >
                        {splitEnabled && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded border-omn-border accent-omn-primary"
                          />
                        )}
                        <div className={`w-8 h-8 ${pm.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {pm.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-omn-heading">{pmLabel}</p>
                          {pmBalance && <p className="text-xs text-omn-accent font-mono">{pmBalance}</p>}
                        </div>
                        {!splitEnabled && isSelected && (
                          <span className="text-omn-primary text-sm">{"\u2713"}</span>
                        )}
                      </button>

                      {/* Split amount input */}
                      {splitEnabled && isSelected && (
                        <div className="ml-11 mt-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-omn-text">$</span>
                            <input
                              type="number"
                              value={splitAmounts[pm.id] ?? ""}
                              onChange={(e) =>
                                setSplitAmounts((prev) => ({
                                  ...prev,
                                  [pm.id]: Number(e.target.value) || 0,
                                }))
                              }
                              placeholder="0.00"
                              className="w-24 px-2 py-1 bg-omn-surface border border-omn-border rounded text-omn-heading text-sm font-mono focus:border-omn-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Split summary */}
              {splitEnabled && selectedPaymentIds.length > 0 && (
                <div className="mt-4 bg-omn-surface rounded-lg p-3 space-y-1">
                  {selectedPaymentIds.map((id) => {
                    const pm = paymentMethods.find((m) => m.id === id);
                    const amt = splitAmounts[id] ?? 0;
                    return (
                      <div key={id} className="flex justify-between text-xs">
                        <span className="text-omn-text">{pm?.type === "apple_pay" ? "Apple Pay" : pm?.type === "google_wallet" ? "Google Wallet" : pm?.cryptoSymbol ?? pm?.label}</span>
                        <span className="text-omn-heading font-mono">${amt.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-omn-border pt-1 flex justify-between text-xs">
                    <span className="text-omn-text">Remaining</span>
                    <span className={`font-mono ${remaining <= 0 ? "text-omn-success" : "text-omn-accent"}`}>
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Bank statement note */}
              <div className="mt-3 flex items-start gap-2 p-2 bg-omn-surface/50 rounded-lg">
                <span className="text-xs text-omn-primary mt-0.5">{"\u2139"}</span>
                <p className="text-xs text-omn-text">
                  Your bank statement will show <strong className="text-omn-heading font-mono">{omnidMerchant.name.toUpperCase()}</strong> — OmnID is never visible to your bank or the merchant.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setOmnidPayStep("idle")}
                  className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOmnidPayConfirm}
                  disabled={selectedPaymentIds.length === 0 || (splitEnabled && remaining > 0.01)}
                  className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay ${omnidMerchant.amount.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        {omnidPayStep === "paying" && (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-omn-heading">Processing OmnID Pay...</p>
            <p className="text-xs text-omn-text mt-1">
              {splitEnabled ? `Splitting across ${selectedPaymentIds.length} methods` : "Charging selected method"} {"\u2192"} {omnidMerchant.name}
            </p>
          </div>
        )}

        {omnidPayStep === "done" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-omn-heading font-medium mb-1">Payment Complete</p>
            <p className="text-sm text-omn-text mb-1">
              ${omnidMerchant.amount.toFixed(2)} paid to {omnidMerchant.name}
            </p>
            <p className="text-xs text-omn-accent mb-4">
              Bank statement: "{omnidMerchant.name.toUpperCase()}" — OmnID invisible
            </p>
            <button
              onClick={() => setOmnidPayStep("idle")}
              className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ═══ TRADE CRYPTO ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">
          Trade Crypto
        </h2>
        <p className="text-sm text-omn-text mb-4">
          Swap between tokens directly from your OmnID wallet.
        </p>

        {tradeStep === "idle" && (
          <div>
            {/* Market overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {tradingPairs.slice(0, 6).map((pair) => (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => {
                    setTradeFrom(pair.from);
                    setTradeTo(pair.to);
                    setTradeAmount("");
                    setTradeStep("configure");
                  }}
                  className="p-3 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-omn-heading">{pair.from}/{pair.to}</span>
                    <span className={`text-xs font-mono ${pair.change >= 0 ? "text-omn-success" : "text-omn-danger"}`}>
                      {pair.change >= 0 ? "+" : ""}{pair.change}%
                    </span>
                  </div>
                  <p className="text-xs text-omn-text font-mono">{pair.price}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setTradeStep("configure")}
              className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors"
            >
              Custom Trade
            </button>
          </div>
        )}

        {tradeStep === "configure" && (
          <div className="max-w-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-omn-text mb-1">From</label>
                <select
                  value={tradeFrom}
                  onChange={(e) => setTradeFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading text-sm focus:border-omn-primary focus:outline-none"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-omn-text mb-1">To</label>
                <select
                  value={tradeTo}
                  onChange={(e) => setTradeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading text-sm focus:border-omn-primary focus:outline-none"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="BTC">BTC</option>
                  <option value="SOL">SOL</option>
                  <option value="MATIC">MATIC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-omn-text mb-1">Amount ({tradeFrom})</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading text-sm font-mono focus:border-omn-primary focus:outline-none"
              />
            </div>

            {tradeAmount && Number(tradeAmount) > 0 && currentPair && (
              <div className="bg-omn-bg rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">You pay</span>
                  <span className="text-omn-heading font-mono">{Number(tradeAmount).toFixed(2)} {tradeFrom}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">You receive</span>
                  <span className="text-omn-success font-mono">{tradeEstimate} {tradeTo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">Rate</span>
                  <span className="text-omn-text font-mono">1 {tradeFrom} = {currentPair.price} {tradeTo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-omn-text">Network fee</span>
                  <span className="text-omn-accent font-mono">~$0.12</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setTradeStep("idle"); setTradeAmount(""); }}
                className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={!tradeAmount || Number(tradeAmount) <= 0 || !currentPair}
                className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Swap {tradeFrom} {"\u2192"} {tradeTo}
              </button>
            </div>
          </div>
        )}

        {tradeStep === "confirming" && (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-omn-heading">Executing swap...</p>
            <p className="text-xs text-omn-text mt-1">{tradeFrom} {"\u2192"} {tradeTo} on-chain</p>
          </div>
        )}

        {tradeStep === "done" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-omn-heading font-medium mb-1">Swap Complete</p>
            <p className="text-sm text-omn-text mb-1">
              {Number(tradeAmount).toFixed(2)} {tradeFrom} {"\u2192"} {tradeEstimate} {tradeTo}
            </p>
            <p className="text-xs text-omn-accent mb-4">Balance updated in your OmnID wallet</p>
            <button
              onClick={() => { setTradeStep("idle"); setTradeAmount(""); }}
              className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ═══ TRANSACTION HISTORY ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-4">
          Payment History
        </h2>
        <div className="space-y-2">
          {bridgeHistory.length === 0 && (
            <p className="text-sm text-omn-text text-center py-4">No payment history yet. Try a card-only bridge or OmnID Pay above.</p>
          )}
          {bridgeHistory.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 bg-omn-bg rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-omn-primary/20 rounded-lg flex items-center justify-center text-omn-primary text-xs font-bold">
                  {"\u2713"}
                </div>
                <div>
                  <p className="text-sm text-omn-heading">{tx.merchant}</p>
                  <p className="text-xs text-omn-text">
                    {tx.method} · {tx.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-omn-heading">
                  ${tx.amount.toFixed(2)}
                </p>
                <p className="text-xs font-mono text-omn-text">
                  Stmt: {tx.bankStatement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
