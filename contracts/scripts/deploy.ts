import hre from "hardhat";
import {
  createWalletClient,
  createPublicClient,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function main() {
  const pk = process.env.PRIVATE_KEY as Hex;
  if (!pk) throw new Error("Set PRIVATE_KEY in .env");

  console.log("Deploying OmnID contracts to Base Sepolia...\n");

  const account = privateKeyToAccount(pk);
  console.log("Deployer:", account.address);

  const rpc = "https://sepolia.base.org";
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpc),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(rpc),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", Number(balance) / 1e18, "ETH\n");

  async function deploy(name: string, args: Hex[] = []): Promise<Hex> {
    const artifact = await hre.artifacts.readArtifact(name);
    const encodedArgs =
      args.length > 0
        ? args.map((a) => a.slice(2).padStart(64, "0")).join("")
        : "";
    const data = (artifact.bytecode + encodedArgs) as Hex;

    const hash = await walletClient.sendTransaction({
      data,
      chain: baseSepolia,
    });
    console.log(`  ${name}: tx ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const address = receipt.contractAddress!;
    console.log(`  ${name} deployed: ${address}\n`);
    return address;
  }

  // 1. Deploy IdentityRegistry (foundation)
  const identityRegistry = await deploy("IdentityRegistry");

  // 2. Deploy CredentialRegistry
  const credentialRegistry = await deploy("CredentialRegistry", [
    identityRegistry as Hex,
  ]);

  // 3. Deploy AgeVerifier
  const ageVerifier = await deploy("AgeVerifier", [identityRegistry as Hex]);

  // 4. Deploy ReputationAggregator
  const reputationAggregator = await deploy("ReputationAggregator", [
    identityRegistry as Hex,
  ]);

  // 5. Deploy VerificationGateway
  const verificationGateway = await deploy("VerificationGateway", [
    identityRegistry as Hex,
    credentialRegistry as Hex,
    ageVerifier as Hex,
    reputationAggregator as Hex,
  ]);

  // 6. Deploy PaymentBridge
  const paymentBridge = await deploy("PaymentBridge", [
    identityRegistry as Hex,
  ]);

  console.log("========================================");
  console.log("  OmnID Deployment Complete!");
  console.log("========================================");
  console.log(`  IdentityRegistry:     ${identityRegistry}`);
  console.log(`  CredentialRegistry:   ${credentialRegistry}`);
  console.log(`  AgeVerifier:          ${ageVerifier}`);
  console.log(`  ReputationAggregator: ${reputationAggregator}`);
  console.log(`  VerificationGateway:  ${verificationGateway}`);
  console.log(`  PaymentBridge:        ${paymentBridge}`);
  console.log("========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
