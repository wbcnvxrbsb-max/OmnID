import { useReadContract, useWriteContract, useAccount, useChainId } from "wagmi";
import { keccak256, encodePacked } from "viem";
import {
  IdentityRegistryAbi,
  ReputationAggregatorAbi,
  PaymentBridgeAbi,
  VerificationGatewayAbi,
} from "../contracts/abis";
import { getAddresses } from "../contracts/addresses";

// ─── Identity ───────────────────────────────────────

export function useHasIdentity() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);
  return useReadContract({
    address: addrs.identityRegistry,
    abi: IdentityRegistryAbi,
    functionName: "hasIdentity",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useIdentity() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);
  return useReadContract({
    address: addrs.identityRegistry,
    abi: IdentityRegistryAbi,
    functionName: "getIdentity",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useCreateIdentity() {
  const { writeContract, ...rest } = useWriteContract();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);

  function createIdentity(metadataHash: `0x${string}`, recoveryAddress: `0x${string}`, ssnCommitment: `0x${string}`) {
    writeContract({
      address: addrs.identityRegistry,
      abi: IdentityRegistryAbi,
      functionName: "createIdentity",
      args: [metadataHash, recoveryAddress, ssnCommitment],
    });
  }

  return { createIdentity, ...rest };
}

export function useLinkAccount() {
  const { writeContract, ...rest } = useWriteContract();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);

  function linkAccount(accountIdentifier: string) {
    const hash = keccak256(encodePacked(["string"], [accountIdentifier]));
    writeContract({
      address: addrs.identityRegistry,
      abi: IdentityRegistryAbi,
      functionName: "linkAccount",
      args: [hash],
    });
  }

  return { linkAccount, ...rest };
}

// ─── Reputation ─────────────────────────────────────

export function useCompositeReputation() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);
  return useReadContract({
    address: addrs.reputationAggregator,
    abi: ReputationAggregatorAbi,
    functionName: "getCompositeReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTransferReputation() {
  const { writeContract, ...rest } = useWriteContract();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);

  function transferReputation(sourcePlatform: `0x${string}`, destPlatform: `0x${string}`) {
    writeContract({
      address: addrs.reputationAggregator,
      abi: ReputationAggregatorAbi,
      functionName: "transferReputation",
      args: [sourcePlatform, destPlatform],
    });
  }

  return { transferReputation, ...rest };
}

// ─── Payment Bridge ─────────────────────────────────

export function useBridgePayment() {
  const { writeContract, ...rest } = useWriteContract();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);

  function bridgePayment(sourceMethod: `0x${string}`, destMethod: `0x${string}`, amount: bigint) {
    writeContract({
      address: addrs.paymentBridge,
      abi: PaymentBridgeAbi,
      functionName: "bridgePayment",
      args: [sourceMethod, destMethod, amount],
    });
  }

  return { bridgePayment, ...rest };
}

export function useBridgeHistory() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);
  return useReadContract({
    address: addrs.paymentBridge,
    abi: PaymentBridgeAbi,
    functionName: "getBridgeHistory",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ─── Verification ───────────────────────────────────

export function useVerify() {
  const { writeContract, ...rest } = useWriteContract();
  const chainId = useChainId();
  const addrs = getAddresses(chainId);

  function verify(
    userAddress: `0x${string}`,
    minAge: bigint,
    minReputation: bigint,
    requiredCredential: `0x${string}`,
    checkReputation: boolean,
  ) {
    writeContract({
      address: addrs.verificationGateway,
      abi: VerificationGatewayAbi,
      functionName: "verify",
      args: [userAddress, minAge, minReputation, requiredCredential, checkReputation],
    });
  }

  return { verify, ...rest };
}
