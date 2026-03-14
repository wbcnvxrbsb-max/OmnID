import { useState, useEffect } from "react";
import { getTransactionHistory, type Transaction } from "../api/txn-history";
import { CHAIN_META } from "../wallet";
import { formatEther } from "viem";

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(unixSeconds: string): string {
  const seconds = Math.floor(Date.now() / 1000 - Number(unixSeconds));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString();
}

export default function TxnHistory({ address }: { address: string }) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const history = await getTransactionHistory(address);
        if (!cancelled) setTxns(history);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load transactions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (address) load();
    else {
      setTxns([]);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [address]);

  return (
    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-omn-heading mb-4">
        Transaction History
      </h2>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-omn-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-omn-text">Loading transactions...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-sm text-red-400 text-center py-6">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && txns.length === 0 && (
        <div className="text-center py-10">
          <div className="w-10 h-10 mx-auto mb-3 bg-omn-border/30 rounded-full flex items-center justify-center text-omn-text text-lg">
            —
          </div>
          <p className="text-sm text-omn-text">No transactions yet</p>
          <p className="text-xs text-omn-text mt-1">
            On-chain transactions will appear here once your wallet is active.
          </p>
        </div>
      )}

      {/* Transaction list */}
      {!loading && !error && txns.length > 0 && (
        <div className="space-y-2">
          {txns.map((tx) => {
            const meta = CHAIN_META[tx.chainId];
            const isSent = tx.from.toLowerCase() === address.toLowerCase();
            const failed = tx.isError === "1";
            let ethValue: string;
            try {
              ethValue = formatEther(BigInt(tx.value));
            } catch {
              ethValue = "0";
            }
            // Trim trailing zeroes but keep at least 4 decimals for readability
            const shortValue = parseFloat(ethValue).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");

            return (
              <div
                key={`${tx.chainId}-${tx.hash}`}
                className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg"
              >
                {/* Chain icon */}
                <div
                  className={`w-8 h-8 ${meta?.color ?? "bg-gray-600"} rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0`}
                >
                  {meta?.icon ?? "?"}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-omn-heading">
                      {isSent ? "Sent" : "Received"}
                    </span>
                    {failed && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                        Failed
                      </span>
                    )}
                    {!failed && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-omn-success/20 text-omn-success rounded-full font-medium">
                        Success
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-omn-text truncate">
                    {isSent ? "To" : "From"}{" "}
                    <span className="font-mono">
                      {truncateAddress(isSent ? tx.to : tx.from)}
                    </span>
                    <span className="mx-1.5 text-omn-border">|</span>
                    <span className="text-omn-text">{meta?.name ?? `Chain ${tx.chainId}`}</span>
                  </p>
                </div>

                {/* Value + time */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-mono font-medium ${isSent ? "text-red-400" : "text-omn-success"}`}>
                    {isSent ? "-" : "+"}{shortValue} ETH
                  </p>
                  <p className="text-[10px] text-omn-text">
                    {timeAgo(tx.timeStamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
