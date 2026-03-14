/**
 * ERC-20 token balance reader — reads real on-chain balances.
 * No API key needed, just public RPCs.
 */

import { formatUnits } from "viem";
import { makePublicClient, SUPPORTED_CHAINS } from "../wallet";

// Standard ERC-20 balanceOf ABI
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Token addresses per chain ID
// Only include chains where the token exists
const TOKEN_ADDRESSES: Record<string, Record<number, { address: `0x${string}`; decimals: number }>> = {
  USDC: {
    1:     { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    137:   { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    42161: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    10:    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    43114: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    56:    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    8453:  { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  },
  USDT: {
    1:     { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    137:   { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    42161: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 },
    10:    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    43114: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
    56:    { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    8453:  { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 },
  },
  DAI: {
    1:     { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
    137:   { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 },
    42161: { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    10:    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    8453:  { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18 },
  },
};

export interface TokenBalance {
  symbol: string;
  chainId: number;
  chainName: string;
  balance: bigint;
  formatted: string;
  decimals: number;
}

/**
 * Fetch all ERC-20 token balances for an address across all supported chains.
 * Returns only non-zero balances.
 */
export async function getTokenBalances(address: `0x${string}`): Promise<TokenBalance[]> {
  const results: TokenBalance[] = [];

  const calls: Promise<void>[] = [];

  for (const [symbol, chains] of Object.entries(TOKEN_ADDRESSES)) {
    for (const chain of SUPPORTED_CHAINS) {
      const tokenInfo = chains[chain.id];
      if (!tokenInfo) continue;

      calls.push(
        (async () => {
          try {
            const client = makePublicClient(chain);
            const balance = await client.readContract({
              address: tokenInfo.address,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            });
            if (balance > 0n) {
              results.push({
                symbol,
                chainId: chain.id,
                chainName: chain.name,
                balance,
                formatted: formatUnits(balance, tokenInfo.decimals),
                decimals: tokenInfo.decimals,
              });
            }
          } catch {
            // RPC error — skip silently
          }
        })()
      );
    }
  }

  await Promise.allSettled(calls);
  return results;
}

export const TOKEN_SYMBOLS = Object.keys(TOKEN_ADDRESSES);
