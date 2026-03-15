import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { getAddress, hasWallet } from "../wallet";
import { API_BASE } from "../api/config";

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

const EXTERNAL_FAUCETS = [
  {
    name: "Alchemy Base Sepolia Faucet",
    url: "https://www.alchemy.com/faucets/base-sepolia",
    description: "Get 0.1 Base Sepolia ETH. Requires an Alchemy account.",
    icon: "AL",
    color: "bg-blue-600",
  },
  {
    name: "QuickNode Base Sepolia Faucet",
    url: "https://faucet.quicknode.com/base/sepolia",
    description: "Get testnet ETH with no signup required.",
    icon: "QN",
    color: "bg-purple-600",
  },
];

export default function Faucet() {
  const walletAddress = getAddress();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [recipientBalance, setRecipientBalance] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; txHash?: string; explorer?: string; error?: string } | null>(null);

  // Use wallet address as default recipient
  useEffect(() => {
    if (walletAddress && !recipientAddress) {
      setRecipientAddress(walletAddress);
    }
  }, [walletAddress]);

  // Fetch own wallet balance
  useEffect(() => {
    if (!walletAddress) return;
    async function fetchBalance() {
      try {
        const client = createPublicClient({ chain: baseSepolia, transport: http(BASE_SEPOLIA_RPC) });
        const bal = await client.getBalance({ address: walletAddress! });
        setBalance(formatEther(bal));
      } catch {
        setBalance(null);
      }
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Fetch recipient balance when address changes
  useEffect(() => {
    if (!recipientAddress || !recipientAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      setRecipientBalance(null);
      return;
    }
    let cancelled = false;
    async function fetch() {
      try {
        const client = createPublicClient({ chain: baseSepolia, transport: http(BASE_SEPOLIA_RPC) });
        const bal = await client.getBalance({ address: recipientAddress as `0x${string}` });
        if (!cancelled) setRecipientBalance(formatEther(bal));
      } catch {
        if (!cancelled) setRecipientBalance(null);
      }
    }
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [recipientAddress]);

  async function handleRequest() {
    if (!recipientAddress.match(/^0x[0-9a-fA-F]{40}$/)) return;
    setSending(true);
    setResult(null);
    try {
      const res = await window.fetch(`${API_BASE}/api/faucet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: recipientAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, txHash: data.txHash, explorer: data.explorer });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (e: any) {
      setResult({ success: false, error: e?.message ?? "Request failed" });
    } finally {
      setSending(false);
    }
  }

  const validAddress = recipientAddress.match(/^0x[0-9a-fA-F]{40}$/);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-omn-heading mb-2">
          OmnID Faucet
        </h1>
        <p className="text-omn-text">
          Get free Base Sepolia testnet ETH for OmnID's on-chain features
        </p>
      </div>

      {/* Own Wallet Info */}
      {hasWallet() && walletAddress && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-omn-text">Your Wallet</span>
            <button
              onClick={() => navigator.clipboard.writeText(walletAddress)}
              className="text-xs font-mono text-omn-accent bg-omn-bg px-3 py-1.5 rounded hover:bg-omn-border/50 transition-colors cursor-pointer"
              title="Click to copy"
            >
              {walletAddress}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-omn-text">Balance</span>
            <span className="text-lg font-bold font-mono text-omn-heading">
              {balance !== null ? `${Number(balance).toFixed(6)} ETH` : "Loading..."}
            </span>
          </div>
        </div>
      )}

      {/* OmnID Faucet — send to any address */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-1">Request Testnet ETH</h2>
        <p className="text-xs text-omn-text mb-4">
          Enter any Base Sepolia address to receive 0.01 ETH. Gas is covered by OmnID.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-omn-text mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value.trim())}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-omn-bg border border-omn-border rounded-lg text-omn-heading font-mono text-sm focus:border-omn-primary focus:outline-none transition-colors"
            />
            {recipientAddress && !validAddress && (
              <p className="text-xs text-omn-danger mt-1">Enter a valid Ethereum address (0x...)</p>
            )}
            {validAddress && recipientBalance !== null && (
              <p className="text-xs text-omn-text mt-1">
                Current balance: <span className="font-mono text-omn-accent">{Number(recipientBalance).toFixed(6)} ETH</span>
              </p>
            )}
          </div>

          {/* Quick-fill buttons */}
          {hasWallet() && walletAddress && recipientAddress !== walletAddress && (
            <button
              onClick={() => setRecipientAddress(walletAddress)}
              className="text-xs text-omn-primary hover:text-omn-primary-light transition-colors"
            >
              Use my wallet address
            </button>
          )}

          <button
            onClick={handleRequest}
            disabled={!validAddress || sending}
            className="w-full py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-omn-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending 0.01 ETH..." : "Request 0.01 ETH"}
          </button>

          {/* Result */}
          {result?.success && (
            <div className="bg-omn-success/10 border border-omn-success/30 rounded-xl p-4">
              <p className="text-sm font-medium text-omn-success mb-1">Sent 0.01 ETH!</p>
              {result.explorer && (
                <a
                  href={result.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-omn-accent hover:text-omn-primary transition-colors break-all"
                >
                  View on BaseScan {"\u2197"}
                </a>
              )}
            </div>
          )}

          {result && !result.success && (
            <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-xl p-4">
              <p className="text-sm font-medium text-omn-danger mb-1">{result.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* External Faucets (backup) */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-omn-heading mb-3">External Faucets</h2>
        <p className="text-xs text-omn-text mb-3">If the OmnID faucet is empty, use an external faucet:</p>
        <div className="space-y-2">
          {EXTERNAL_FAUCETS.map((faucet) => (
            <a
              key={faucet.name}
              href={faucet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors group"
            >
              <div className={`w-8 h-8 ${faucet.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {faucet.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-omn-heading group-hover:text-omn-primary transition-colors">{faucet.name}</p>
                <p className="text-[10px] text-omn-text">{faucet.description}</p>
              </div>
              <span className="text-omn-text text-xs">{"\u2197"}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Network Info */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-omn-heading mb-3">Network Details</h2>
        <div className="space-y-2">
          {[
            { label: "Network", value: "Base Sepolia" },
            { label: "Chain ID", value: "84532" },
            { label: "Currency", value: "ETH (testnet)" },
            { label: "RPC", value: "https://sepolia.base.org" },
            { label: "Explorer", value: "https://sepolia.basescan.org" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <span className="text-xs text-omn-text">{item.label}</span>
              <span className="text-xs font-mono text-omn-heading">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-omn-accent/10 border border-omn-accent/30 rounded-xl p-4">
        <p className="text-xs text-omn-text">
          <span className="text-omn-accent font-medium">Note:</span> Base Sepolia ETH is testnet currency with no real value.
          It's used to test OmnID's on-chain identity registration, reputation transfers, and payment bridging.
        </p>
      </div>
    </div>
  );
}
