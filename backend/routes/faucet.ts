import { Router } from "express";
import type { Request, Response } from "express";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const router = Router();

const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as `0x${string}` | undefined;
const DRIP_AMOUNT = "0.01"; // ETH per request
const RPC = "https://sepolia.base.org";

// Simple in-memory rate limit (resets on server restart)
const recentRequests = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 1 minute per address

// POST /api/faucet
router.post("/api/faucet", async (req: Request, res: Response) => {
  if (!PRIVATE_KEY) {
    res.status(500).json({ error: "Faucet not configured. Set FAUCET_PRIVATE_KEY." });
    return;
  }

  try {
    const { address } = req.body;
    if (!address || typeof address !== "string" || !address.match(/^0x[0-9a-fA-F]{40}$/)) {
      res.status(400).json({ error: "Invalid Ethereum address" });
      return;
    }

    // Rate limit
    const lastRequest = recentRequests.get(address.toLowerCase());
    if (lastRequest && Date.now() - lastRequest < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastRequest)) / 1000);
      res.status(429).json({ error: `Please wait ${waitSec}s before requesting again.` });
      return;
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // Check faucet balance
    const balance = await publicClient.getBalance({ address: account.address });
    const dripWei = parseEther(DRIP_AMOUNT);
    if (balance < dripWei) {
      res.status(503).json({
        error: "Faucet does not have enough funds. Please try again later.",
      });
      return;
    }

    // Send ETH
    const hash = await walletClient.sendTransaction({
      to: address as `0x${string}`,
      value: dripWei,
    });

    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({ hash });

    recentRequests.set(address.toLowerCase(), Date.now());

    res.json({
      success: true,
      amount: DRIP_AMOUNT,
      txHash: hash,
      explorer: `https://sepolia.basescan.org/tx/${hash}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
