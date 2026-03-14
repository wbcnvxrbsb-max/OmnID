/**
 * ENS (Ethereum Name Service) resolution — public RPC, no API key needed.
 * Uses viem's built-in ENS support on Ethereum mainnet.
 */

import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

// Dedicated mainnet client for ENS lookups (ENS contracts live on L1)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Simple in-memory caches to avoid repeated lookups
const nameToAddress = new Map<string, string | null>();
const addressToName = new Map<string, string | null>();
const nameToAvatar = new Map<string, string | null>();

/**
 * Resolve an ENS name (e.g. "vitalik.eth") to an Ethereum address.
 * Returns null if the name doesn't resolve.
 */
export async function resolveENS(name: string): Promise<string | null> {
  const key = name.toLowerCase();
  if (nameToAddress.has(key)) return nameToAddress.get(key)!;

  try {
    const address = await ensClient.getEnsAddress({ name: normalize(key) });
    const result = address ?? null;
    nameToAddress.set(key, result);
    return result;
  } catch {
    nameToAddress.set(key, null);
    return null;
  }
}

/**
 * Reverse-resolve an Ethereum address to its primary ENS name.
 * Returns null if no primary name is set.
 */
export async function reverseENS(address: string): Promise<string | null> {
  const key = address.toLowerCase();
  if (addressToName.has(key)) return addressToName.get(key)!;

  try {
    const name = await ensClient.getEnsName({
      address: address as `0x${string}`,
    });
    const result = name ?? null;
    addressToName.set(key, result);
    return result;
  } catch {
    addressToName.set(key, null);
    return null;
  }
}

/**
 * Get the avatar URL for an ENS name.
 * Returns null if no avatar is set.
 */
export async function getENSAvatar(name: string): Promise<string | null> {
  const key = name.toLowerCase();
  if (nameToAvatar.has(key)) return nameToAvatar.get(key)!;

  try {
    const avatar = await ensClient.getEnsAvatar({ name: normalize(key) });
    const result = avatar ?? null;
    nameToAvatar.set(key, result);
    return result;
  } catch {
    nameToAvatar.set(key, null);
    return null;
  }
}
