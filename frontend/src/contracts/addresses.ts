// Contract addresses per chain
// Update these after deploying contracts

import type { Address } from "viem";

type ContractAddresses = {
  identityRegistry: Address;
  credentialRegistry: Address;
  ageVerifier: Address;
  reputationAggregator: Address;
  verificationGateway: Address;
  paymentBridge: Address;
};

// Base Sepolia testnet (chain ID 84532)
const baseSepolia: ContractAddresses = {
  identityRegistry: "0x0000000000000000000000000000000000000000",
  credentialRegistry: "0x0000000000000000000000000000000000000000",
  ageVerifier: "0x0000000000000000000000000000000000000000",
  reputationAggregator: "0x0000000000000000000000000000000000000000",
  verificationGateway: "0x0000000000000000000000000000000000000000",
  paymentBridge: "0x0000000000000000000000000000000000000000",
};

// Local Hardhat (chain ID 31337)
const hardhat: ContractAddresses = {
  identityRegistry: "0x0000000000000000000000000000000000000000",
  credentialRegistry: "0x0000000000000000000000000000000000000000",
  ageVerifier: "0x0000000000000000000000000000000000000000",
  reputationAggregator: "0x0000000000000000000000000000000000000000",
  verificationGateway: "0x0000000000000000000000000000000000000000",
  paymentBridge: "0x0000000000000000000000000000000000000000",
};

export const addresses: Record<number, ContractAddresses> = {
  84532: baseSepolia,
  31337: hardhat,
};

export function getAddresses(chainId: number): ContractAddresses {
  const addrs = addresses[chainId];
  if (!addrs) throw new Error(`No contract addresses for chain ${chainId}`);
  return addrs;
}
