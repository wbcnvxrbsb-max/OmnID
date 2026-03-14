import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTuF6yvB1q9Y2NuyJWa73PHW_rbJd-d9U",
  authDomain: "omnid-cb415.firebaseapp.com",
  projectId: "omnid-cb415",
  storageBucket: "omnid-cb415.firebasestorage.app",
  messagingSenderId: "980793018433",
  appId: "1:980793018433:web:f4c2e81c75e672e541dec0",
  measurementId: "G-DKFF7QYTY7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Set up invisible reCAPTCHA on a button element.
 * Call this once before sending OTP.
 * The buttonId should be the id of the "Send Code" button.
 */
export function setupRecaptcha(buttonId: string): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved — will proceed with signInWithPhoneNumber
    },
  });
}

/**
 * Send SMS verification code to the given phone number.
 * Phone must be in E.164 format, e.g. "+15551234567"
 */
export async function sendVerificationCode(
  phoneNumber: string
): Promise<void> {
  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized. Call setupRecaptcha first.");
  }
  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    recaptchaVerifier
  );
}

/**
 * Verify the 6-digit code the user received via SMS.
 * Returns true if verified successfully.
 */
export async function verifyCode(code: string): Promise<boolean> {
  if (!confirmationResult) {
    throw new Error("No verification in progress. Send a code first.");
  }
  try {
    await confirmationResult.confirm(code);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up reCAPTCHA verifier.
 */
export function cleanupRecaptcha(): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
}
