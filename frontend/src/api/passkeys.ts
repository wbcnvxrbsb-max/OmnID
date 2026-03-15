/**
 * WebAuthn / Passkey support for OmnID.
 *
 * Uses the Web Authentication API (navigator.credentials) to create and
 * authenticate with passkeys.  Credential IDs are stored in localStorage
 * so the app can remember whether a passkey has already been registered.
 */

const STORAGE_KEY = "omnid-passkey";

/** Relying-party ID — use the production domain when deployed, localhost for dev. */
function rpId(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "localhost";
    return host; // works for omnid.netlify.app or any custom domain
  }
  return "omnid.netlify.app";
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

/** Returns `true` when a credential ID is persisted in localStorage. */
export function hasPasskey(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/** Removes the stored passkey credential ID from localStorage. */
export function clearPasskey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Create a new passkey (WebAuthn credential) for the given username.
 *
 * The credential ID is stored in localStorage so `hasPasskey()` can
 * detect it later.  Returns the full `PublicKeyCredential` on success.
 */
export async function createPasskey(
  username: string,
): Promise<PublicKeyCredential> {
  const userId = new TextEncoder().encode(username);

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

      // ES256 (preferred) + RS256 (fallback)
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],

      challenge: crypto.getRandomValues(new Uint8Array(32)),

      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        // No authenticatorAttachment — allows both platform and cross-platform
      },

      timeout: 120_000,
    },
  });

  if (!credential) {
    throw new Error("Passkey creation was cancelled or failed.");
  }

  // Persist the credential ID so we can request it during authentication.
  const pkCred = credential as PublicKeyCredential;
  const idB64 = bufferToBase64url(pkCred.rawId);
  localStorage.setItem(STORAGE_KEY, idB64);

  return pkCred;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Authenticate with an existing passkey.
 *
 * If a credential ID is stored we include it as an `allowCredentials` hint,
 * but the browser/authenticator will ultimately decide which credential to
 * use.  Returns the `PublicKeyCredential` assertion.
 */
export async function authenticateWithPasskey(): Promise<PublicKeyCredential> {
  const allowCredentials: PublicKeyCredentialDescriptor[] = [];

  const storedId = localStorage.getItem(STORAGE_KEY);
  if (storedId) {
    allowCredentials.push({
      id: base64urlToBuffer(storedId),
      type: "public-key",
    });
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: rpId(),
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: "preferred",
      timeout: 120_000,
    },
  });

  if (!assertion) {
    throw new Error("Passkey authentication was cancelled or failed.");
  }

  return assertion as PublicKeyCredential;
}
