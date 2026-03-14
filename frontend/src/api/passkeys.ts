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
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "localhost";
  }
  return "omnid.netlify.app";
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
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },

      timeout: 60_000,
    },
  });

  if (!credential) {
    throw new Error("Passkey creation was cancelled or failed.");
  }

  // Persist the credential ID so we can request it during authentication.
  const pkCred = credential as PublicKeyCredential;
  const idBytes = new Uint8Array(pkCred.rawId);
  const idB64 = btoa(String.fromCharCode(...idBytes));
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
    const raw = Uint8Array.from(atob(storedId), (c) => c.charCodeAt(0));
    allowCredentials.push({
      id: raw.buffer,
      type: "public-key",
      transports: ["internal"],
    });
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: rpId(),
      allowCredentials,
      userVerification: "preferred",
      timeout: 60_000,
    },
  });

  if (!assertion) {
    throw new Error("Passkey authentication was cancelled or failed.");
  }

  return assertion as PublicKeyCredential;
}
