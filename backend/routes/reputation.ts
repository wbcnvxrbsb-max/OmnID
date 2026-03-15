import { Router } from "express";
import {
  createWalletClient,
  createPublicClient,
  http,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const router = Router();

const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as Hex | undefined;
const RPC = "https://sepolia.base.org";
const REPUTATION_AGGREGATOR = "0xd33422490a03d411365465a56188c40614f745ef" as Address;

// Minimal ABI — only the functions we call
const REPUTATION_ABI = [
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "value", type: "uint256" },
      { name: "starRating", type: "uint256" },
      { name: "totalCompletedJobs", type: "uint256" },
      { name: "onTimeRate", type: "uint256" },
    ],
    name: "submitScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getCompositeReputation",
    outputs: [
      {
        components: [
          { name: "weightedScore", type: "uint256" },
          { name: "sourceCount", type: "uint256" },
          { name: "calculatedAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// POST /api/submit-reputation
// Submits a platform reputation score on-chain via the ReputationAggregator.
// The deployer wallet acts as the registered source.
router.post("/api/submit-reputation", async (req, res) => {
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: "Reputation service not configured" });
  }

  const { email, platformId, score, reviewCount, completedJobs } = req.body;

  if (!email || !platformId) {
    return res.status(400).json({ error: "Missing email or platformId" });
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // The deployer is both the source and the user for the demo.
    // score is 0-100, starRating is score * 100 (e.g. 4.8 -> 480 for the contract's integer math)
    const value = BigInt(Math.round(Number(score) || 0));
    const starRating = BigInt(Math.round((Number(score) / 20) * 100)); // convert 0-100 to 0-5 scale * 100
    const totalCompletedJobs = BigInt(Math.round(Number(completedJobs) || 0));
    const onTimeRate = BigInt(95); // default 95% on-time rate

    const hash = await walletClient.writeContract({
      address: REPUTATION_AGGREGATOR,
      abi: REPUTATION_ABI,
      functionName: "submitScore",
      args: [account.address, value, starRating, totalCompletedJobs, onTimeRate],
      chain: baseSepolia,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`[reputation] Submitted score for ${email} (${platformId}): ${score}, tx: ${hash}`);
    return res.json({ success: true, txHash: hash });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Submit reputation error:", message);
    return res.status(500).json({ error: "Failed to submit reputation on-chain" });
  }
});

// POST /api/get-reputation
// Reads composite reputation from the ReputationAggregator contract.
router.post("/api/get-reputation", async (req, res) => {
  const { walletAddress } = req.body;

  // Use deployer address if no wallet provided
  let targetAddress: Address;
  if (walletAddress && typeof walletAddress === "string" && walletAddress.startsWith("0x")) {
    targetAddress = walletAddress as Address;
  } else if (PRIVATE_KEY) {
    const account = privateKeyToAccount(PRIVATE_KEY);
    targetAddress = account.address;
  } else {
    return res.status(400).json({ error: "No wallet address provided and service not configured" });
  }

  try {
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });

    const result = await publicClient.readContract({
      address: REPUTATION_AGGREGATOR,
      abi: REPUTATION_ABI,
      functionName: "getCompositeReputation",
      args: [targetAddress],
    });

    return res.json({
      success: true,
      reputation: {
        weightedScore: Number(result.weightedScore),
        sourceCount: Number(result.sourceCount),
        calculatedAt: Number(result.calculatedAt),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Get reputation error:", message);
    return res.status(500).json({ error: "Failed to read reputation from chain" });
  }
});

export default router;
