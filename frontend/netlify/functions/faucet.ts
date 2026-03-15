import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as `0x${string}` | undefined;
const DRIP_AMOUNT = "0.01"; // ETH per request
const RPC = "https://sepolia.base.org";

// Simple in-memory rate limit (resets on cold start)
const recentRequests = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 1 minute per address

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ error: "Faucet not configured. Set FAUCET_PRIVATE_KEY." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { address } = await req.json();
    if (!address || typeof address !== "string" || !address.match(/^0x[0-9a-fA-F]{40}$/)) {
      return new Response(
        JSON.stringify({ error: "Invalid Ethereum address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit
    const lastRequest = recentRequests.get(address.toLowerCase());
    if (lastRequest && Date.now() - lastRequest < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastRequest)) / 1000);
      return new Response(
        JSON.stringify({ error: `Please wait ${waitSec}s before requesting again.` }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // Check faucet balance
    const balance = await publicClient.getBalance({ address: account.address });
    const dripWei = parseEther(DRIP_AMOUNT);
    if (balance < dripWei) {
      return new Response(
        JSON.stringify({
          error: "Faucet is empty.",
          faucetAddress: account.address,
          balance: formatEther(balance),
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send ETH
    const hash = await walletClient.sendTransaction({
      to: address as `0x${string}`,
      value: dripWei,
    });

    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({ hash });

    recentRequests.set(address.toLowerCase(), Date.now());

    return new Response(
      JSON.stringify({
        success: true,
        amount: DRIP_AMOUNT,
        txHash: hash,
        explorer: `https://sepolia.basescan.org/tx/${hash}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = {
  path: "/.netlify/functions/faucet",
};
