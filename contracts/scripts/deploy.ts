import hre from "hardhat";
import {
  createWalletClient,
  createPublicClient,
  http,
  getContractAddress,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

async function main() {
  console.log("Deploying OmnID contracts...\n");

  // Hardhat default account #0
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  async function deploy(name: string, args: Hex[] = []): Promise<Hex> {
    const artifact = await hre.artifacts.readArtifact(name);
    const encodedArgs =
      args.length > 0
        ? args.map((a) => a.slice(2).padStart(64, "0")).join("")
        : "";
    const data = (artifact.bytecode + encodedArgs) as Hex;

    const hash = await walletClient.sendTransaction({
      data,
      chain: hardhat,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const address = receipt.contractAddress!;
    console.log(`${name} deployed: ${address}`);
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

  console.log("\n========================================");
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
