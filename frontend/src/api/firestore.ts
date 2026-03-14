// Firestore persistence — syncs omnid-* localStorage keys across browsers
// Uses the existing Firebase app from firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTuF6yvB1q9Y2NuyJWa73PHW_rbJd-d9U",
  authDomain: "omnid-cb415.firebaseapp.com",
  projectId: "omnid-cb415",
  storageBucket: "omnid-cb415.firebasestorage.app",
  messagingSenderId: "980793018433",
  appId: "1:980793018433:web:f4c2e81c75e672e541dec0",
  measurementId: "G-DKFF7QYTY7",
};

// Reuse existing Firebase app or initialize if needed
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

/** All omnid-* localStorage keys to sync */
const SYNC_KEYS = [
  "omnid-google-user",
  "omnid-detected-platforms",
  "omnid-linked-profiles",
  "omnid-pay-methods",
  "omnid-transfer-history",
  "omnid-reg-providers",
  "omnid-pro-subscribed",
  "omnid-pro-session-id",
  "omnid-parent-data",
  "omnid-activity",
  "omnid-wallet",
] as const;

/**
 * Collect all omnid-* localStorage values into a plain object.
 * Keys with no value are omitted.
 */
function collectLocalData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (const key of SYNC_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }
  return data;
}

/**
 * Push all omnid-* localStorage keys to Firestore under users/{userId}.
 */
export async function syncToFirestore(userId: string): Promise<void> {
  const data = collectLocalData();
  await setDoc(doc(db, "users", userId), data, { merge: true });
}

/**
 * Pull all data from Firestore users/{userId} and write to localStorage.
 * Existing local keys that are NOT in Firestore are left untouched.
 */
export async function loadFromFirestore(userId: string): Promise<void> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return;

  const data = snap.data() as Record<string, string>;
  for (const key of SYNC_KEYS) {
    if (key in data && typeof data[key] === "string") {
      localStorage.setItem(key, data[key]);
    }
  }
}

// ---------- autoSync ----------

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _storageHandler: ((e: StorageEvent) => void) | null = null;
let _activeUserId: string | null = null;

/**
 * Debounced push to Firestore.
 * Resets the 2-second timer on every call.
 */
function schedulePush(userId: string): void {
  if (_syncTimer !== null) {
    clearTimeout(_syncTimer);
  }
  _syncTimer = setTimeout(() => {
    _syncTimer = null;
    void syncToFirestore(userId);
  }, 2000);
}

/**
 * Start automatic syncing: any change to an omnid-* localStorage key
 * triggers a debounced push to Firestore (2 second delay).
 *
 * The listener uses the "storage" event (fires when another tab modifies
 * localStorage) and also patches localStorage.setItem in the current tab.
 */
export function autoSync(userId: string): void {
  // Clean up any previous listener first
  stopAutoSync();

  _activeUserId = userId;

  // Listen for cross-tab storage changes
  _storageHandler = (e: StorageEvent) => {
    if (e.key && (SYNC_KEYS as readonly string[]).includes(e.key)) {
      schedulePush(userId);
    }
  };
  window.addEventListener("storage", _storageHandler);

  // Patch localStorage.setItem to detect same-tab writes
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    originalSetItem.call(this, key, value);
    if ((SYNC_KEYS as readonly string[]).includes(key)) {
      schedulePush(userId);
    }
  };

  // Store reference so we can restore later
  (autoSync as any)._originalSetItem = originalSetItem;
}

/**
 * Stop automatic syncing and clean up listeners.
 */
export function stopAutoSync(): void {
  if (_storageHandler) {
    window.removeEventListener("storage", _storageHandler);
    _storageHandler = null;
  }

  if (_syncTimer !== null) {
    clearTimeout(_syncTimer);
    _syncTimer = null;
  }

  // Restore original setItem if we patched it
  if ((autoSync as any)._originalSetItem) {
    Storage.prototype.setItem = (autoSync as any)._originalSetItem;
    delete (autoSync as any)._originalSetItem;
  }

  _activeUserId = null;
}
