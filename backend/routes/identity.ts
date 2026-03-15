import { Router } from "express";
import {
  createWalletClient,
  createPublicClient,
  http,
  keccak256,
  encodePacked,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const router = Router();

const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as Hex | undefined;
const RPC = "https://sepolia.base.org";
const IDENTITY_REGISTRY = "0x7482502d6797df28a78a42c00e7df3cc5d5860d8" as Hex;

// Minimal ABI for createIdentity and hasIdentity
const IDENTITY_ABI = [
  {
    inputs: [
      { name: "metadataHash", type: "bytes32" },
      { name: "recoveryAddress", type: "address" },
      { name: "ssnCommitment", type: "bytes32" },
    ],
    name: "createIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "hasIdentity",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

router.post("/api/register-identity", async (req, res) => {
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: "Identity registration not configured" });
  }

  const { name, email, ssnHash: clientSsnHash, walletAddress } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email" });
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // Use the user's wallet address if provided, otherwise derive one from their email
    const recoveryAddress = (walletAddress || account.address) as Hex;

    // Hash identity data
    const metadataHash = keccak256(encodePacked(["string", "string"], [name, email]));
    const ssnCommitment = (clientSsnHash || keccak256(encodePacked(["string"], ["unknown"]))) as Hex;

    // Check if already registered (by metadata hash — we check the deployer's identity for now)
    // In production, you'd map email → on-chain address in a database

    // Register on-chain
    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: IDENTITY_ABI,
      functionName: "createIdentity",
      args: [metadataHash, recoveryAddress, ssnCommitment],
      chain: baseSepolia,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return res.json({
      success: true,
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
      explorer: `https://sepolia.basescan.org/tx/${hash}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // If it's a "already has identity" error, that's fine
    if (message.includes("already") || message.includes("Identity exists")) {
      return res.json({ success: true, alreadyRegistered: true });
    }
    return res.status(500).json({ error: message });
  }
});

export default router;
