/**
 * WebAuthn / Passkey support for OmnID.
 *
 * Supports multiple passkeys per user. Credential IDs are stored as a
 * JSON array in localStorage. Adding a new passkey requires authenticating
 * with an existing one first.
 */

const STORAGE_KEY = "omnid-passkeys";
// Migration: old single-key format
const OLD_STORAGE_KEY = "omnid-passkey";

/** Relying-party ID — use the production domain when deployed, localhost for dev. */
function rpId(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "localhost";
    return host;
  }
  return "omnid.onrender.com";
}

/** Encode ArrayBuffer to base64url string */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Decode base64url string to ArrayBuffer */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ---------------------------------------------------------------------------
// Storage helpers (array of credential IDs)
// ---------------------------------------------------------------------------

function getStoredPasskeys(): string[] {
  // Migrate from old single-key format
  const old = localStorage.getItem(OLD_STORAGE_KEY);
  if (old) {
    const arr = [old];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    localStorage.removeItem(OLD_STORAGE_KEY);
    return arr;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePasskeys(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Returns `true` when the current browser supports WebAuthn. */
export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials !== "undefined"
  );
}

/** Returns `true` when at least one passkey credential is stored. */
export function hasPasskey(): boolean {
  return getStoredPasskeys().length > 0;
}

/** Returns the number of stored passkeys. */
export function getPasskeyCount(): number {
  return getStoredPasskeys().length;
}

/** Returns all stored passkey credential IDs. */
export function getPasskeyIds(): string[] {
  return getStoredPasskeys();
}

/** Removes all stored passkey credential IDs. */
export function clearPasskey(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(OLD_STORAGE_KEY);
}

/** Removes a specific passkey by its credential ID. */
export function removePasskey(credentialId: string): void {
  const ids = getStoredPasskeys().filter((id) => id !== credentialId);
  savePasskeys(ids);
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Create a new passkey (WebAuthn credential) for the given username.
 * The credential ID is added to the stored array.
 */
export async function createPasskey(
  username: string,
): Promise<PublicKeyCredential> {
  const userId = new TextEncoder().encode(username);

  // Exclude existing credentials so the authenticator creates a new one
  const existing = getStoredPasskeys();
  const excludeCredentials: PublicKeyCredentialDescriptor[] = existing.map((id) => ({
    id: base64urlToBuffer(id),
    type: "public-key",
  }));

  const credential = await navigator.credentials.create({
    publicKey: {
      rp: {
        name: "OmnID",
        id: rpId(),
      },

      user: {
        id: userId,
        name: username,
        displayName: username,
      },

      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],

      challenge: crypto.getRandomValues(new Uint8Array(32)),

      excludeCredentials,

      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },

      timeout: 120_000,
    },
  });

  if (!credential) {
    throw new Error("Passkey creation was cancelled or failed.");
  }

  const pkCred = credential as PublicKeyCredential;
  const idB64 = bufferToBase64url(pkCred.rawId);

  // Add to stored array
  const ids = getStoredPasskeys();
  if (!ids.includes(idB64)) {
    ids.push(idB64);
  }
  savePasskeys(ids);

  return pkCred;
}

/**
 * Add an additional passkey. Requires authenticating with an existing
 * passkey first to prove identity, then creates a new one.
 */
export async function addPasskey(username: string): Promise<PublicKeyCredential> {
  // Step 1: Verify with existing passkey
  await authenticateWithPasskey();
  // Step 2: Create new passkey
  return createPasskey(username);
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Authenticate with a passkey.
 *
 * Does NOT use localStorage to find credentials — the browser discovers
 * available passkeys for this domain automatically (discoverable credentials).
 * This is more secure: even if localStorage is compromised, the attacker
 * can't authenticate without the physical passkey.
 *
 * Returns the credential ID (base64url) along with the assertion so the
 * caller can verify it against the blockchain.
 */
export async function authenticateWithPasskey(): Promise<{ credential: PublicKeyCredential; credentialId: string }> {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: rpId(),
      // No allowCredentials — let the browser discover all passkeys for this domain
      userVerification: "preferred",
      timeout: 120_000,
    },
  });

  if (!assertion) {
    throw new Error("Passkey authentication was cancelled or failed.");
  }

  const pkCred = assertion as PublicKeyCredential;
  const credentialId = bufferToBase64url(pkCred.rawId);

  return { credential: pkCred, credentialId };
}
