/**
 * Transaction history fetcher — reads real on-chain transactions
 * from free public block explorer APIs (no API key needed for basic usage).
 *
 * Supported chains:
 *   - Ethereum (1)      via etherscan.io
 *   - Base (8453)       via basescan.org
 *   - Hardhat (31337)   via local JSON-RPC
 */

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasUsed: string;
  isError: string;
  chainId: number;
  chainName: string;
}

/** Explorer base URLs keyed by chain ID */
const EXPLORER_API: Record<number, { url: string; name: string }> = {
  1: {
    url: "https://api.etherscan.io/api",
    name: "Ethereum",
  },
  8453: {
    url: "https://api.basescan.org/api",
    name: "Base",
  },
};

/**
 * Fetch transaction list from an Etherscan-compatible API.
 */
async function fetchExplorerTxns(
  address: string,
  chainId: number,
): Promise<Transaction[]> {
  const explorer = EXPLORER_API[chainId];
  if (!explorer) return [];

  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    sort: "desc",
    page: "1",
    offset: "10",
  });

  try {
    const res = await fetch(`${explorer.url}?${params}`);
    if (!res.ok) return [];

    const json = await res.json();

    // Etherscan returns { status: "1", result: [...] } on success
    if (json.status !== "1" || !Array.isArray(json.result)) return [];

    return json.result.map((tx: Record<string, string>) => ({
      hash: tx.hash ?? "",
      from: tx.from ?? "",
      to: tx.to ?? "",
      value: tx.value ?? "0",
      timeStamp: tx.timeStamp ?? "0",
      gasUsed: tx.gasUsed ?? "0",
      isError: tx.isError ?? "0",
      chainId,
      chainName: explorer.name,
    }));
  } catch {
    // Rate-limited or network error — fail silently
    return [];
  }
}

/**
 * Fetch recent transactions from a local Hardhat node.
 * Walks backwards through the latest blocks and filters for the user's address.
 */
async function fetchHardhatTxns(address: string): Promise<Transaction[]> {
  const rpc = "http://127.0.0.1:8545";
  const lowerAddr = address.toLowerCase();

  try {
    // Get the latest block number
    const blockNumRes = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    if (!blockNumRes.ok) return [];
    const blockNumJson = await blockNumRes.json();
    const latestBlock = parseInt(blockNumJson.result, 16);

    const txns: Transaction[] = [];
    // Scan the last 20 blocks (or fewer if chain is short)
    const startBlock = Math.max(0, latestBlock - 20);

    const blockPromises: Promise<void>[] = [];
    for (let i = latestBlock; i >= startBlock && txns.length < 10; i--) {
      blockPromises.push(
        (async () => {
          const blockRes = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: i,
              method: "eth_getBlockByNumber",
              params: [`0x${i.toString(16)}`, true],
            }),
          });
          if (!blockRes.ok) return;
          const blockJson = await blockRes.json();
          const block = blockJson.result;
          if (!block || !block.transactions) return;

          for (const tx of block.transactions) {
            const txFrom = (tx.from ?? "").toLowerCase();
            const txTo = (tx.to ?? "").toLowerCase();
            if (txFrom === lowerAddr || txTo === lowerAddr) {
              txns.push({
                hash: tx.hash ?? "",
                from: tx.from ?? "",
                to: tx.to ?? "",
                value: tx.value ? String(parseInt(tx.value, 16)) : "0",
                timeStamp: block.timestamp
                  ? String(parseInt(block.timestamp, 16))
                  : "0",
                gasUsed: tx.gas ? String(parseInt(tx.gas, 16)) : "0",
                isError: "0",
                chainId: 31337,
                chainName: "OmnID Local",
              });
            }
          }
        })(),
      );
    }

    await Promise.allSettled(blockPromises);
    return txns.slice(0, 10);
  } catch {
    // Local node not running — that is fine
    return [];
  }
}

/**
 * Fetch transaction history for an address across multiple chains in parallel.
 * Results are combined and sorted by timestamp descending.
 *
 * @param address  - The wallet address to look up
 * @param chainId  - Optional: restrict to a single chain ID
 */
export async function getTransactionHistory(
  address: string,
  chainId?: number,
): Promise<Transaction[]> {
  const fetchers: Promise<Transaction[]>[] = [];

  if (chainId !== undefined) {
    // Single chain requested
    if (chainId === 31337) {
      fetchers.push(fetchHardhatTxns(address));
    } else {
      fetchers.push(fetchExplorerTxns(address, chainId));
    }
  } else {
    // Fetch from all supported chains in parallel
    for (const id of Object.keys(EXPLORER_API)) {
      fetchers.push(fetchExplorerTxns(address, Number(id)));
    }
    fetchers.push(fetchHardhatTxns(address));
  }

  const results = await Promise.allSettled(fetchers);
  const allTxns: Transaction[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allTxns.push(...result.value);
    }
  }

  // Sort by timestamp descending (most recent first)
  allTxns.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));

  return allTxns;
}
