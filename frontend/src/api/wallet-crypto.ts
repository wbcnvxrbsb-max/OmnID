/**
 * wallet-crypto.ts — AES-GCM encryption for the wallet mnemonic.
 *
 * Stores the encrypted mnemonic in localStorage under "omnid-wallet-enc"
 * as a JSON object: { iv: base64, data: base64 }.
 *
 * The encryption key is derived from a passphrase (the user's Google email)
 * using PBKDF2 with a fixed salt. This means the mnemonic is not readable
 * in plain text from DevTools, and cannot be decrypted without knowing the
 * email that was used at encryption time.
 */

const STORAGE_KEY_ENC = "omnid-wallet-enc";
const STORAGE_KEY_PLAIN = "omnid-wallet";
const PBKDF2_SALT = new TextEncoder().encode("omnid-wallet-salt");
const PBKDF2_ITERATIONS = 100_000;

// ---------------------------------------------------------------------------
// Key derivation
// ---------------------------------------------------------------------------

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: PBKDF2_SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ---------------------------------------------------------------------------
// Encrypt / decrypt helpers
// ---------------------------------------------------------------------------

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encrypt a mnemonic and store it in localStorage under the encrypted key.
 * The plaintext key ("omnid-wallet") is removed after successful encryption.
 */
export async function encryptAndStore(
  mnemonic: string,
  passphrase: string,
): Promise<void> {
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(mnemonic),
  );

  const payload = JSON.stringify({
    iv: toBase64(iv.buffer),
    data: toBase64(ciphertext),
  });

  localStorage.setItem(STORAGE_KEY_ENC, payload);
  // Remove plaintext once encrypted copy is safely stored
  localStorage.removeItem(STORAGE_KEY_PLAIN);
}

/**
 * Load and decrypt the mnemonic from localStorage.
 * Returns `null` if no encrypted mnemonic is stored or decryption fails.
 */
export async function loadEncrypted(
  passphrase: string,
): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_KEY_ENC);
  if (!raw) return null;

  try {
    const { iv, data } = JSON.parse(raw) as { iv: string; data: string };
    const key = await deriveKey(passphrase);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(iv) },
      key,
      fromBase64(data),
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    // Decryption failed — wrong passphrase or corrupted data
    return null;
  }
}

/**
 * Migrate plaintext mnemonic to encrypted storage.
 * Call this once on app startup after the user is authenticated.
 *
 * If a plaintext mnemonic exists in localStorage and no encrypted version
 * exists yet, this encrypts the plaintext and removes it.
 */
export async function migrateToEncrypted(
  passphrase: string,
): Promise<void> {
  const plain = localStorage.getItem(STORAGE_KEY_PLAIN);
  const hasEncrypted = localStorage.getItem(STORAGE_KEY_ENC) !== null;

  if (plain && !hasEncrypted) {
    await encryptAndStore(plain, passphrase);
  }
}

/**
 * Returns true if there is an encrypted mnemonic stored.
 */
export function hasEncryptedWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY_ENC) !== null;
}

/**
 * Remove the encrypted wallet from localStorage.
 */
export function deleteEncryptedWallet(): void {
  localStorage.removeItem(STORAGE_KEY_ENC);
}
