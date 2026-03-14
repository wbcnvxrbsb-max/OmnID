import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { getAddress, hasWallet } from "../wallet";
import { Link } from "react-router-dom";

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
    name: "Coinbase Base Faucet",
    url: "https://portal.cdp.coinbase.com/products/faucet",
    description: "Official Base faucet from Coinbase. Requires Coinbase account.",
    icon: "CB",
    color: "bg-blue-500",
  },
  {
    name: "QuickNode Base Sepolia Faucet",
    url: "https://faucet.quicknode.com/base/sepolia",
    description: "Get testnet ETH with no signup required.",
    icon: "QN",
    color: "bg-purple-600",
  },
  {
    name: "Superchain Faucet",
    url: "https://app.optimism.io/faucet",
    description: "Get testnet ETH for Base Sepolia and other OP Stack chains.",
    icon: "SC",
    color: "bg-red-500",
  },
];

export default function Faucet() {
  const [balance, setBalance] = useState<string | null>(null);
  const address = getAddress();

  // Fetch Base Sepolia balance
  useEffect(() => {
    if (!address) return;
    async function fetchBalance() {
      try {
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(BASE_SEPOLIA_RPC),
        });
        const bal = await client.getBalance({ address: address! });
        setBalance(formatEther(bal));
      } catch {
        setBalance(null);
      }
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);

  if (!hasWallet()) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-omn-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-omn-primary">F</span>
        </div>
        <h1 className="text-2xl font-bold text-omn-heading mb-2">
          Base Sepolia Faucet
        </h1>
        <p className="text-omn-text mb-6">
          You need a wallet first to receive test ETH.
        </p>
        <Link
          to="/trading"
          className="px-6 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors"
        >
          Create Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-omn-heading mb-2">
          Base Sepolia Faucet
        </h1>
        <p className="text-omn-text">
          Get free testnet ETH on Base Sepolia to use OmnID's on-chain features
        </p>
      </div>

      {/* Wallet Info */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-omn-text">Your Wallet</span>
          <button
            onClick={() => navigator.clipboard.writeText(address!)}
            className="text-xs font-mono text-omn-accent bg-omn-bg px-3 py-1.5 rounded hover:bg-omn-border/50 transition-colors cursor-pointer"
            title="Click to copy"
          >
            {address}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-omn-text">Balance (Base Sepolia)</span>
          <span className="text-lg font-bold font-mono text-omn-heading">
            {balance !== null
              ? `${Number(balance).toFixed(6)} ETH`
              : "Loading..."}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-omn-primary/10 border border-omn-primary/30 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-omn-heading mb-2">How to get testnet ETH</h2>
        <ol className="space-y-2 text-sm text-omn-text">
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-omn-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-omn-primary shrink-0">1</span>
            <span>Click a faucet below to open it in a new tab</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-omn-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-omn-primary shrink-0">2</span>
            <span>Paste your wallet address (click it above to copy)</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-omn-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-omn-primary shrink-0">3</span>
            <span>Request testnet ETH — your balance will update automatically</span>
          </li>
        </ol>
      </div>

      {/* Faucet Links */}
      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-semibold text-omn-heading">Available Faucets</h2>
        {EXTERNAL_FAUCETS.map((faucet) => (
          <a
            key={faucet.name}
            href={faucet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-omn-surface border border-omn-border rounded-xl hover:border-omn-primary/50 transition-colors group"
          >
            <div className={`w-10 h-10 ${faucet.color} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {faucet.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-omn-heading group-hover:text-omn-primary transition-colors">
                {faucet.name}
              </p>
              <p className="text-xs text-omn-text">{faucet.description}</p>
            </div>
            <span className="text-omn-text group-hover:text-omn-primary transition-colors">
              {"\u2197"}
            </span>
          </a>
        ))}
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

      {/* Info Note */}
      <div className="mt-6 bg-omn-accent/10 border border-omn-accent/30 rounded-xl p-4">
        <p className="text-xs text-omn-text">
          <span className="text-omn-accent font-medium">Note:</span> Base Sepolia ETH is testnet currency with no real value.
          It's used to test OmnID's on-chain identity registration, reputation transfers, and payment bridging.
        </p>
      </div>
    </div>
  );
}
