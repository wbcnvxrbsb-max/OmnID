import { generateMnemonic, mnemonicToAccount, english } from "viem/accounts";
import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
  type Chain,
} from "viem";
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  bsc,
  base,
  baseSepolia,
} from "viem/chains";
import { getAlchemyUrl } from "./api/alchemy";

const STORAGE_KEY = "omnid-wallet";

export const SUPPORTED_CHAINS: Chain[] = [
  baseSepolia,
  mainnet,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  bsc,
  base,
];

export const CHAIN_META: Record<number, { name: string; icon: string; color: string }> = {
  84532: { name: "Base Sepolia", icon: "BS",   color: "bg-blue-600" },
  1:     { name: "Ethereum",     icon: "ETH",  color: "bg-indigo-600" },
  137:   { name: "Polygon",      icon: "POL",  color: "bg-purple-600" },
  42161: { name: "Arbitrum",     icon: "ARB",  color: "bg-blue-500" },
  10:    { name: "Optimism",     icon: "OP",   color: "bg-red-600" },
  43114: { name: "Avalanche",    icon: "AVAX", color: "bg-red-500" },
  56:    { name: "BNB Chain",    icon: "BNB",  color: "bg-yellow-500" },
  8453:  { name: "Base",         icon: "BASE", color: "bg-blue-600" },
};

export function hasWallet(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function createNewWallet(): string {
  const mnemonic = generateMnemonic(english);
  localStorage.setItem(STORAGE_KEY, mnemonic);
  return mnemonic;
}

export function importWallet(mnemonic: string): void {
  // Validate by attempting to derive — throws if invalid
  mnemonicToAccount(mnemonic);
  localStorage.setItem(STORAGE_KEY, mnemonic);
}

export function getMnemonic(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function getAccount() {
  const mnemonic = getMnemonic();
  if (!mnemonic) return null;
  return mnemonicToAccount(mnemonic);
}

export function getAddress(): `0x${string}` | null {
  return getAccount()?.address ?? null;
}

function getTransport(chain: Chain) {
  // Base Sepolia uses public RPC
  if (chain.id === 84532) return http("https://sepolia.base.org");
  // Use Alchemy if configured for this chain, otherwise default public RPC
  const alchemyUrl = getAlchemyUrl(chain.id);
  return alchemyUrl ? http(alchemyUrl) : http();
}

export function makeWalletClient(chain: Chain) {
  const account = getAccount();
  if (!account) throw new Error("No wallet");
  return createWalletClient({
    account,
    chain,
    transport: getTransport(chain),
  });
}

export function makePublicClient(chain: Chain) {
  return createPublicClient({
    chain,
    transport: getTransport(chain),
  });
}

export interface ChainBalance {
  balance: bigint;
  formatted: string;
  symbol: string;
}

export async function getNativeBalances(address: `0x${string}`) {
  const results: Record<number, ChainBalance> = {};
  await Promise.allSettled(
    SUPPORTED_CHAINS.map(async (chain) => {
      const client = makePublicClient(chain);
      const balance = await client.getBalance({ address });
      results[chain.id] = {
        balance,
        formatted: formatEther(balance),
        symbol: chain.nativeCurrency.symbol,
      };
    })
  );
  return results;
}

export function deleteWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
}
