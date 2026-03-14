import { useState, useEffect } from "react";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { getAddress, hasWallet } from "../wallet";
import { Link } from "react-router-dom";

const HARDHAT_RPC = "http://127.0.0.1:8545";

// Hardhat default funded accounts (each has 10,000 ETH)
const FAUCET_ACCOUNTS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
] as const;

const PRESET_AMOUNTS = [
  { label: "0.1 ETH", value: "0.1" },
  { label: "0.5 ETH", value: "0.5" },
  { label: "1 ETH", value: "1" },
  { label: "5 ETH", value: "5" },
  { label: "10 ETH", value: "10" },
  { label: "100 ETH", value: "100" },
];

export default function Faucet() {
  const [amount, setAmount] = useState("1");
  const [customAmount, setCustomAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [nodeOnline, setNodeOnline] = useState<boolean | null>(null);
  const [history, setHistory] = useState<
    { amount: string; hash: string; time: number }[]
  >([]);

  const address = getAddress();

  // Check if local node is running
  useEffect(() => {
    async function checkNode() {
      try {
        const res = await fetch(HARDHAT_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1,
          }),
        });
        const data = await res.json();
        setNodeOnline(!!data.result);
      } catch {
        setNodeOnline(false);
      }
    }
    checkNode();
    const interval = setInterval(checkNode, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch balance
  useEffect(() => {
    if (!address || !nodeOnline) return;
    async function fetchBalance() {
      try {
        const client = createPublicClient({
          chain: hardhat,
          transport: http(HARDHAT_RPC),
        });
        const bal = await client.getBalance({ address: address! });
        setBalance(formatEther(bal));
      } catch {
        setBalance(null);
      }
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, [address, nodeOnline, txHash]);

  async function handleSend() {
    if (!address) return;
    const sendAmount = customAmount || amount;
    setSending(true);
    setError(null);
    setTxHash(null);

    try {
      const account = privateKeyToAccount(FAUCET_ACCOUNTS[0]);
      const walletClient = createWalletClient({
        account,
        chain: hardhat,
        transport: http(HARDHAT_RPC),
      });

      const hash = await walletClient.sendTransaction({
        to: address,
        value: parseEther(sendAmount),
        chain: hardhat,
      });

      const publicClient = createPublicClient({
        chain: hardhat,
        transport: http(HARDHAT_RPC),
      });
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setHistory((prev) => [
        { amount: sendAmount, hash, time: Date.now() },
        ...prev,
      ]);
      setCustomAmount("");
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }

  if (!hasWallet()) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-omn-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚰</span>
        </div>
        <h1 className="text-2xl font-bold text-omn-heading mb-2">
          OmnID Testnet Faucet
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
          Testnet Faucet
        </h1>
        <p className="text-omn-text">
          Get free test ETH from the local Hardhat node
        </p>
      </div>

      {/* Node Status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${
          nodeOnline
            ? "bg-omn-success/10 border-omn-success/30"
            : nodeOnline === false
            ? "bg-omn-danger/10 border-omn-danger/30"
            : "bg-omn-surface border-omn-border"
        }`}
      >
        <span
          className={`w-3 h-3 rounded-full ${
            nodeOnline
              ? "bg-omn-success animate-pulse"
              : nodeOnline === false
              ? "bg-omn-danger"
              : "bg-omn-text"
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              nodeOnline
                ? "text-omn-success"
                : nodeOnline === false
                ? "text-omn-danger"
                : "text-omn-text"
            }`}
          >
            {nodeOnline
              ? "Local Hardhat Node — Online"
              : nodeOnline === false
              ? "Local Node Offline"
              : "Checking..."}
          </p>
          <p className="text-xs text-omn-text">
            {nodeOnline
              ? HARDHAT_RPC
              : "Run `npx hardhat node` in the contracts directory"}
          </p>
        </div>
      </div>

      {!nodeOnline && nodeOnline !== null && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
          <p className="text-sm text-omn-heading font-medium mb-2">
            Start the local node:
          </p>
          <code className="block bg-omn-bg text-omn-accent text-sm px-4 py-3 rounded-lg font-mono">
            cd contracts && npx hardhat node
          </code>
        </div>
      )}

      {nodeOnline && (
        <>
          {/* Wallet Info */}
          <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-omn-text">Your Wallet</span>
              <span className="text-xs font-mono text-omn-accent bg-omn-bg px-2 py-1 rounded">
                {address}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-omn-text">
                Balance (Hardhat Local)
              </span>
              <span className="text-lg font-bold font-mono text-omn-heading">
                {balance !== null
                  ? `${Number(balance).toFixed(4)} ETH`
                  : "Loading..."}
              </span>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-omn-heading mb-4">
              Select Amount
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setAmount(preset.value);
                    setCustomAmount("");
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    amount === preset.value && !customAmount
                      ? "bg-omn-primary text-white"
                      : "bg-omn-bg border border-omn-border text-omn-text hover:text-omn-heading hover:border-omn-primary"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Or enter custom amount..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-omn-bg border border-omn-border rounded-lg px-4 py-3 text-sm text-omn-heading placeholder:text-omn-text/50 focus:outline-none focus:border-omn-primary transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-omn-text">
                ETH
              </span>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || (!customAmount && !amount)}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              sending
                ? "bg-omn-primary/50 text-white/50 cursor-wait"
                : "bg-omn-primary hover:bg-omn-primary-light text-white hover:shadow-lg hover:shadow-omn-primary/20"
            }`}
          >
            {sending
              ? "Sending..."
              : `Send ${customAmount || amount} ETH to My Wallet`}
          </button>

          {/* Success */}
          {txHash && (
            <div className="mt-4 bg-omn-success/10 border border-omn-success/30 rounded-xl p-4">
              <p className="text-sm font-medium text-omn-success mb-1">
                Transaction Confirmed!
              </p>
              <p className="text-xs font-mono text-omn-text break-all">
                tx: {txHash}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-omn-danger/10 border border-omn-danger/30 rounded-xl p-4">
              <p className="text-sm font-medium text-omn-danger mb-1">
                Error
              </p>
              <p className="text-xs text-omn-text">{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 bg-omn-surface border border-omn-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-omn-heading mb-3">
                Recent Claims
              </h2>
              <div className="space-y-2">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-omn-bg rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-omn-heading">
                        +{item.amount} ETH
                      </span>
                      <span className="text-xs text-omn-text ml-2">
                        {new Date(item.time).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-omn-accent">
                      {item.hash.slice(0, 10)}...{item.hash.slice(-6)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-omn-accent/10 border border-omn-accent/30 rounded-xl p-4">
            <p className="text-xs text-omn-text">
              <span className="text-omn-accent font-medium">Note:</span> This
              faucet sends from Hardhat's pre-funded accounts (10,000 ETH
              each). This is local test ETH with no real value. The node resets
              when restarted.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
