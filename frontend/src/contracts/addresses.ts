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

// Base Sepolia testnet (chain ID 84532) — deployed 2026-03-15
const baseSepolia: ContractAddresses = {
  identityRegistry: "0x7482502d6797df28a78a42c00e7df3cc5d5860d8",
  credentialRegistry: "0xb1240ff3ba52d71d0368512ad2926dca1956d299",
  ageVerifier: "0x5994bb4a97030fc603cbd960538139fb12d6c468",
  reputationAggregator: "0xd33422490a03d411365465a56188c40614f745ef",
  verificationGateway: "0xc0a82b9d64c03fd1a0718b235310326d25c63279",
  paymentBridge: "0x3b430e1b8a0bd27660820f24b7a1c8828133f3e5",
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
