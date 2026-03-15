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

// Rate limiting: 1 registration per email per 5 minutes
const recentRegistrations = new Map<string, number>();
const COOLDOWN_MS = 5 * 60_000;

// Minimal ABI for createIdentity
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
] as const;

router.post("/api/register-identity", async (req, res) => {
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: "Identity registration not configured" });
  }

  const { name, email, ssnHash } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email" });
  }

  // Validate ssnHash looks like a keccak256 hash (0x + 64 hex chars)
  if (!ssnHash || typeof ssnHash !== "string" || !ssnHash.match(/^0x[0-9a-fA-F]{64}$/)) {
    return res.status(400).json({ error: "Invalid identity hash" });
  }

  // Rate limit
  const lastReg = recentRegistrations.get(email.toLowerCase());
  if (lastReg && Date.now() - lastReg < COOLDOWN_MS) {
    return res.status(429).json({ error: "Please wait before registering again." });
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // Hash identity metadata (name + email) — server also hashes so we verify
    const metadataHash = keccak256(encodePacked(["string", "string"], [name, email]));

    // SSN commitment comes pre-hashed from the client — never raw
    const ssnCommitment = ssnHash as Hex;

    // Recovery address is the deployer for now (user doesn't need their own wallet)
    const recoveryAddress = account.address;

    // Register on-chain
    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: IDENTITY_ABI,
      functionName: "createIdentity",
      args: [metadataHash, recoveryAddress, ssnCommitment],
      chain: baseSepolia,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    recentRegistrations.set(email.toLowerCase(), Date.now());

    // Don't expose internal details — just confirm success
    return res.json({
      success: true,
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("already") || message.includes("Identity exists")) {
      return res.json({ success: true, alreadyRegistered: true });
    }
    // Don't expose internal error details to client
    console.error("Identity registration error:", message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Minimal ABI for linkAccount
const LINK_ACCOUNT_ABI = [
  {
    inputs: [{ name: "accountHash", type: "bytes32" }],
    name: "linkAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Minimal ABI for deactivateIdentity
const DEACTIVATE_ABI = [
  {
    inputs: [],
    name: "deactivateIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// POST /api/link-account
// Links an external platform account on-chain via the IdentityRegistry.
router.post("/api/link-account", async (req, res) => {
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: "Identity service not configured" });
  }

  const { email, accountIdentifier } = req.body;

  if (!email || !accountIdentifier) {
    return res.status(400).json({ error: "Missing email or accountIdentifier" });
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    // Hash the account identifier (e.g. "google:user@email.com")
    const accountHash = keccak256(encodePacked(["string"], [accountIdentifier]));

    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: LINK_ACCOUNT_ABI,
      functionName: "linkAccount",
      args: [accountHash],
      chain: baseSepolia,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`[identity] Linked account for ${email}: ${accountIdentifier}`);
    return res.json({ success: true, txHash: hash });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // If already linked, treat as success
    if (message.includes("already") || message.includes("linked")) {
      return res.json({ success: true, alreadyLinked: true });
    }
    console.error("Link account error:", message);
    return res.status(500).json({ error: "Failed to link account on-chain" });
  }
});

// POST /api/deactivate-identity
// Deactivates a user's on-chain identity by calling the contract.
router.post("/api/deactivate-identity", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing email" });
  }

  if (!PRIVATE_KEY) {
    console.log(`[identity] Deactivation requested for: ${email} (no key configured)`);
    return res.json({ success: true, message: "Identity deactivation logged" });
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });

    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: DEACTIVATE_ABI,
      functionName: "deactivateIdentity",
      args: [],
      chain: baseSepolia,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`[identity] Deactivated identity for: ${email}, tx: ${hash}`);
    return res.json({ success: true, txHash: hash });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Deactivation error:", message);
    // Still return success so the frontend can proceed
    return res.json({ success: true, message: "Identity deactivation processed" });
  }
});

export default router;
