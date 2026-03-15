import { useState, useEffect } from "react";
import { lookupSSN, sandboxDatabase } from "../data/sandbox-ssn";
import { usePersistedState } from "../hooks/usePersistedState";
import { isGoogleConfigured, googleSignIn, getGoogleUser, clearGoogleUser, detectPlatforms, getDetectedPlatforms, type GoogleUser, type DetectedPlatform } from "../google-auth";
import { pushActivity } from "../activity";
import { setupRecaptcha, sendVerificationCode, verifyCode, cleanupRecaptcha } from "../api/firebase";
import { isPasskeySupported, createPasskey, hasPasskey, clearPasskey } from "../api/passkeys";

type Step = "oauth" | "passkey" | "phone" | "ssn" | "complete";

const steps: { key: Step; label: string }[] = [
  { key: "oauth", label: "Sign In" },
  { key: "passkey", label: "Passkey" },
  { key: "phone", label: "Phone (optional)" },
  { key: "ssn", label: "Identity (optional)" },
  { key: "complete", label: "Complete" },
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function Registration() {
  const [currentStep, setCurrentStep] = usePersistedState<Step>("reg-step", "oauth");
  const [linkedProviders, setLinkedProviders] = usePersistedState<string[]>("reg-providers", []);
  const [passkeyType, setPasskeyType] = usePersistedState<string | null>("reg-passkey", null);
  const [phone, setPhone] = usePersistedState("reg-phone", "");
  const [phoneVerified, setPhoneVerified] = usePersistedState("reg-phone-verified", false);
  const [ssn, setSsn] = useState("");
  const [ssnError, setSsnError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedPerson, setVerifiedPerson] = usePersistedState<{
    name: string;
    age: number;
  } | null>("reg-verified-person", null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [, setRecaptchaReady] = useState(false);
  const [usedSSNs, setUsedSSNs] = usePersistedState<string[]>("reg-used-ssns", []);
  const [googleUser, setGoogleUser] = usePersistedState<GoogleUser | null>("google-user", getGoogleUser());
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [detectedPlatforms, setDetectedPlatforms] = usePersistedState<DetectedPlatform[]>("detected-platforms", getDetectedPlatforms());
  const [scanning, setScanning] = useState(false);

  // WebAuthn passkey state
  const [passkeySupported] = useState(() => isPasskeySupported());
  const [passkeyRegistered, setPasskeyRegistered] = usePersistedState("passkey-registered", hasPasskey());
  const [passkeyCredentialId, setPasskeyCredentialId] = usePersistedState<string | null>("passkey-cred-id", null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  // Facebook demo sign-up
  const [fbModalOpen, setFbModalOpen] = useState(false);
  const [fbEmail, setFbEmail] = useState("");
  const [fbPassword, setFbPassword] = useState("");
  const [fbName, setFbName] = useState("");
  const [fbBirthday, setFbBirthday] = useState("");
  const [fbStep, setFbStep] = useState<"form" | "loading" | "done">("form");

  function handleFbSignUp() {
    if (!fbEmail || !fbPassword || !fbName) return;
    setFbStep("loading");
    setTimeout(() => {
      setFbStep("done");
      if (!linkedProviders.includes("facebook")) {
        setLinkedProviders((prev) => [...prev, "facebook"]);
      }
      localStorage.setItem("omnid-fb-user", JSON.stringify({
        name: fbName,
        email: fbEmail,
        birthday: fbBirthday,
      }));
      pushActivity(`Signed up with Facebook (${fbEmail})`, "FB", "bg-blue-700");
    }, 1500);
  }

  function handleFbClose() {
    setFbModalOpen(false);
    setFbStep("form");
    setFbEmail("");
    setFbPassword("");
    setFbName("");
    setFbBirthday("");
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  function toggleProvider(provider: string) {
    setLinkedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  }

  async function handleGoogleAuth() {
    if (isGoogleConfigured()) {
      setGoogleLoading(true);
      setGoogleError("");
      try {
        const user = await googleSignIn();
        setGoogleUser(user);
        if (!linkedProviders.includes("google")) {
          setLinkedProviders((prev) => [...prev, "google"]);
        }
        pushActivity(`Signed in with Google (${user.email})`, "GO", "bg-blue-600");
        // Scan Gmail for platforms
        setScanning(true);
        setDetectedPlatforms([]);
        try {
          await detectPlatforms((found) => {
            setDetectedPlatforms((prev) => [...prev, found]);
          });
        } catch {
          // Gmail scan is best-effort — don't block sign-in
        }
        setScanning(false);
      } catch (e: any) {
        setGoogleError(e?.message ?? "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    } else {
      toggleProvider("google");
    }
  }

  function handleGoogleDisconnect() {
    clearGoogleUser();
    setGoogleUser(null);
    setLinkedProviders((prev) => prev.filter((p) => p !== "google"));
    pushActivity("Disconnected Google account", "GO", "bg-blue-600");
  }

  // Set up reCAPTCHA when on the phone step
  useEffect(() => {
    if (currentStep === "phone" && !phoneVerified) {
      // Small delay to ensure DOM element exists
      const timer = setTimeout(() => {
        try {
          setupRecaptcha("send-otp-btn");
          setRecaptchaReady(true);
        } catch {
          // reCAPTCHA may already be set up
        }
      }, 500);
      return () => {
        clearTimeout(timer);
        cleanupRecaptcha();
        setRecaptchaReady(false);
      };
    }
  }, [currentStep, phoneVerified]);

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setOtpSending(true);
    setOtpError("");
    setOtpInput("");
    try {
      const e164 = "+1" + digits; // US numbers
      await sendVerificationCode(e164);
      setOtpSent(true);
    } catch (e: any) {
      setOtpError(e?.message ?? "Failed to send code. Make sure Phone auth is enabled in Firebase.");
    } finally {
      setOtpSending(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpError("");
    try {
      const success = await verifyCode(otpInput);
      if (success) {
        setPhoneVerified(true);
        setOtpSent(false);
        setOtpInput("");
        cleanupRecaptcha();
        pushActivity("Phone number verified via Firebase", "PH", "bg-green-600");
      } else {
        setOtpError("Incorrect code. Please try again.");
      }
    } catch (e: any) {
      setOtpError(e?.message ?? "Verification failed.");
    }
  }

  const [ssnPerson, setSsnPerson] = useState<{ name: string; age: number; birthdate: string } | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Compute age mismatch between Google birthday and SSN birthdate
  const googleBirthday = googleUser?.birthday ?? null; // "YYYY-MM-DD" or "MM-DD"
  const ssnBirthdate = ssnPerson?.birthdate ?? null;
  const ageMatch = (() => {
    if (!googleBirthday || !ssnBirthdate) return null; // can't compare
    // Google might be "YYYY-MM-DD" or just "MM-DD"
    const gParts = googleBirthday.split("-");
    const sParts = ssnBirthdate.split("-");
    if (gParts.length === 3 && sParts.length === 3) {
      // Full dates — compare
      return googleBirthday === ssnBirthdate;
    }
    // Partial — compare month/day only
    const gMonthDay = gParts.slice(-2).join("-");
    const sMonthDay = sParts.slice(-2).join("-");
    return gMonthDay === sMonthDay;
  })();

  function handleVerifySSN() {
    setSsnError("");
    const formatted = formatSSN(ssn);
    const person = lookupSSN(formatted);
    if (!person) {
      setSsnError(
        "SSN not found in sandbox database. Try one of the test SSNs below."
      );
      return;
    }
    if (usedSSNs.includes(formatted)) {
      setSsnError("This SSN has already been registered with OmnID.");
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      setUsedSSNs((prev) => [...prev, formatted]);
      setSsnPerson({ name: person.name, age: person.age, birthdate: person.birthdate });
      setVerifiedPerson({ name: person.name, age: person.age });
      setVerifying(false);
      pushActivity(`Identity verified (age ${person.age})`, "ID", "bg-cyan-600");
    }, 1500);
  }

  function handleConfirmAge() {
    setAgeConfirmed(true);
    setCurrentStep("complete");
  }

  function skipToComplete() {
    setCurrentStep("complete");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">
        Create Your OmnID
      </h1>
      <p className="text-omn-text mb-8">
        Sign in with Google to start. That's enough to transfer data between apps.
      </p>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                i < stepIndex
                  ? "bg-omn-success text-white"
                  : i === stepIndex
                  ? "bg-omn-primary text-white"
                  : "bg-omn-surface border border-omn-border text-omn-text"
              }`}
            >
              {i < stepIndex ? "\u2713" : i + 1}
            </div>
            <span
              className={`text-sm whitespace-nowrap ${
                i === stepIndex
                  ? "text-omn-heading font-medium"
                  : "text-omn-text"
              }`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  i < stepIndex ? "bg-omn-success" : "bg-omn-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: OAuth — this is all you need */}
      {currentStep === "oauth" && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-2">
            Sign In
          </h2>
          <p className="text-sm text-omn-text mb-6">
            Sign in with Google — that's all you need to start transferring your data between apps.
            No registration forms, no government ID required.
          </p>

          <div className="space-y-3 mb-6">
            {/* Google — real OAuth when configured */}
            <button
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                linkedProviders.includes("google")
                  ? "border-omn-success bg-omn-success/10"
                  : "border-omn-border hover:border-omn-primary"
              }`}
            >
              {googleUser?.picture ? (
                <img src={googleUser.picture} alt="" className="w-10 h-10 rounded-lg shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">GO</div>
              )}
              <div className="text-left flex-1">
                {googleLoading ? (
                  <p className="text-sm font-medium text-omn-heading">Signing in...</p>
                ) : linkedProviders.includes("google") && googleUser ? (
                  <>
                    <p className="text-sm font-medium text-omn-heading">{googleUser.name}</p>
                    <p className="text-xs text-omn-text">{googleUser.email}</p>
                  </>
                ) : linkedProviders.includes("google") ? (
                  <>
                    <p className="text-sm font-medium text-omn-heading">Google Linked</p>
                    <p className="text-xs text-omn-text">Gmail, YouTube, Google Drive</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-omn-heading">Sign in with Google</p>
                    <p className="text-xs text-omn-text">Gmail, YouTube, Google Drive</p>
                  </>
                )}
              </div>
              {linkedProviders.includes("google") && (
                <span className="text-omn-success text-lg">{"\u2713"}</span>
              )}
            </button>
            {googleError && <p className="text-xs text-omn-danger ml-1">{googleError}</p>}
            {linkedProviders.includes("google") && (
              <button onClick={handleGoogleDisconnect} className="text-xs text-omn-text hover:text-omn-danger ml-14 transition-colors">Disconnect Google</button>
            )}

            {/* Facebook — demo sign-up */}
            <button
              onClick={() => {
                if (linkedProviders.includes("facebook")) return;
                setFbModalOpen(true);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                linkedProviders.includes("facebook")
                  ? "border-omn-success bg-omn-success/10"
                  : "border-omn-border hover:border-omn-primary"
              }`}
            >
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">FB</div>
              <div className="text-left flex-1">
                {linkedProviders.includes("facebook") ? (
                  <>
                    <p className="text-sm font-medium text-omn-heading">Facebook Connected</p>
                    <p className="text-xs text-omn-text">{fbName || "Facebook, Instagram, Messenger"}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-omn-heading">Sign up with Facebook</p>
                    <p className="text-xs text-omn-text">Facebook, Instagram, Messenger</p>
                  </>
                )}
              </div>
              {linkedProviders.includes("facebook") && (
                <span className="text-omn-success text-lg">{"\u2713"}</span>
              )}
            </button>
            {linkedProviders.includes("facebook") && (
              <button
                onClick={() => {
                  setLinkedProviders((prev) => prev.filter((p) => p !== "facebook"));
                  localStorage.removeItem("omnid-fb-user");
                }}
                className="text-xs text-omn-text hover:text-omn-danger ml-14 transition-colors"
              >
                Disconnect Facebook
              </button>
            )}

            {/* Gmail platform scan results */}
            {(scanning || detectedPlatforms.length > 0) && (
              <div className="ml-1 mt-2 mb-2">
                {scanning && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin w-4 h-4 border-2 border-omn-primary border-t-transparent rounded-full" />
                    <span className="text-xs text-omn-text">Scanning Gmail for linked platforms...</span>
                  </div>
                )}
                {detectedPlatforms.length > 0 && (
                  <div>
                    <p className="text-xs text-omn-text mb-2">
                      {scanning ? `Found ${detectedPlatforms.length} so far...` : `Found ${detectedPlatforms.length} platforms in your Gmail`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detectedPlatforms.map((p) => (
                        <span
                          key={p.domain}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-omn-primary/10 text-omn-primary border border-omn-primary/20 rounded-full"
                        >
                          <span className="font-bold text-[10px]">{p.icon}</span>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          <button
            onClick={() => setCurrentStep("passkey")}
            disabled={linkedProviders.length === 0}
            className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          {linkedProviders.length === 0 && (
            <p className="mt-2 text-xs text-omn-text">Sign in with at least one provider to continue</p>
          )}
        </div>
      )}

      {/* Step 2: Passkey (WebAuthn) — Required */}
      {currentStep === "passkey" && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-2">Create Your Passkey</h2>
          <p className="text-sm text-omn-text mb-1">
            Every OmnID account requires a passkey. It replaces passwords and is used to sign in.
          </p>
          <p className="text-xs text-omn-accent mb-6">
            Required — you'll need this passkey to sign in to OmnID.
          </p>

          <div className="space-y-4 mb-6">
            {/* Biometric icon */}
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 bg-omn-primary/15 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-omn-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 10a2 2 0 1 0 0 4" />
                  <path d="M8.5 8.5a5.5 5.5 0 0 1 9.1 2.3" />
                  <path d="M12 14a5.5 5.5 0 0 1-3.5-5.5" />
                  <path d="M6 6a9 9 0 0 1 14.3 5" />
                  <path d="M12 14c0 2.2-.7 4.1-2 5.5" />
                  <path d="M18.8 12A9 9 0 0 1 10 21.5" />
                  <path d="M4.6 9A9 9 0 0 1 6 6" />
                </svg>
              </div>
              {passkeyRegistered ? (
                <p className="text-sm text-omn-success font-medium">Passkey registered</p>
              ) : passkeyLoading ? (
                <p className="text-sm text-omn-primary font-medium animate-pulse">Waiting for your device...</p>
              ) : (
                <p className="text-sm text-omn-text">Use your fingerprint, face, or device PIN</p>
              )}
            </div>

            {/* Register / Success state */}
            {passkeyRegistered ? (
              <div className="bg-omn-success/10 border border-omn-success/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-omn-success text-lg">{"\u2713"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-omn-heading">Passkey Created</p>
                    {passkeyCredentialId && (
                      <p className="text-xs text-omn-text font-mono mt-1 break-all">
                        ID: {passkeyCredentialId.slice(0, 24)}...
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearPasskey();
                    setPasskeyRegistered(false);
                    setPasskeyCredentialId(null);
                    setPasskeyType(null);
                    if (linkedProviders.includes("passkey")) {
                      setLinkedProviders((prev) => prev.filter((p) => p !== "passkey"));
                    }
                  }}
                  className="text-xs text-omn-text hover:text-omn-danger mt-3 transition-colors"
                >
                  Re-create passkey
                </button>
              </div>
            ) : passkeySupported ? (
              <button
                onClick={async () => {
                  setPasskeyLoading(true);
                  setPasskeyError("");
                  try {
                    const username = googleUser?.name || googleUser?.email || "OmnID User";
                    await createPasskey(username);
                    const storedId = localStorage.getItem("omnid-passkey") ?? "";
                    setPasskeyRegistered(true);
                    setPasskeyCredentialId(storedId);
                    setPasskeyType("webauthn");
                    if (!linkedProviders.includes("passkey")) {
                      setLinkedProviders((prev) => [...prev, "passkey"]);
                    }
                    pushActivity("Passkey registered via WebAuthn", "PK", "bg-purple-600");
                  } catch (e: any) {
                    setPasskeyError(e?.message ?? "Failed to create passkey. Please try again.");
                  } finally {
                    setPasskeyLoading(false);
                  }
                }}
                disabled={passkeyLoading}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-omn-primary/50 bg-omn-primary/5 hover:border-omn-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 bg-omn-primary rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">PK</div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-omn-heading">
                    {passkeyLoading ? "Waiting for device..." : "Create Passkey Now"}
                  </p>
                  <p className="text-xs text-omn-text">Uses your device biometrics or PIN</p>
                </div>
              </button>
            ) : (
              <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-lg p-4">
                <p className="text-sm text-omn-danger font-medium">Passkeys are not supported in this browser.</p>
                <p className="text-xs text-omn-text mt-1">
                  Please use Chrome, Safari, or Edge on a device with biometric support to register.
                </p>
              </div>
            )}

            {passkeyError && (
              <p className="text-xs text-omn-danger">{passkeyError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrentStep("oauth")} className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
            <button
              onClick={() => setCurrentStep("phone")}
              disabled={!passkeyRegistered}
              className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
          {!passkeyRegistered && (
            <p className="mt-2 text-xs text-omn-text">Create a passkey to continue</p>
          )}
        </div>
      )}

      {/* Step 3: Phone (optional) */}
      {currentStep === "phone" && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-omn-heading">Verify Phone Number</h2>
            <span className="text-xs px-2 py-0.5 bg-omn-border rounded-full text-omn-text">Optional</span>
          </div>
          <p className="text-sm text-omn-text mb-6">
            Adding a phone number enables account recovery. You can skip this step.
          </p>

          <div className="mb-6">
            <label className="block text-sm text-omn-text mb-2">Phone Number</label>
            <div className="flex gap-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setPhoneVerified(false);
                  setOtpSent(false);
                  setOtpInput("");
                  setOtpError("");
                }}
                placeholder="(555) 123-4567"
                disabled={otpSent || otpSending}
                className="flex-1 px-4 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading font-mono focus:border-omn-primary focus:outline-none disabled:opacity-50"
              />
              {!phoneVerified && !otpSent && (
                <button
                  id="send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={phone.replace(/\D/g, "").length < 10 || otpSending}
                  className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {otpSending ? "Sending..." : "Send Code"}
                </button>
              )}
            </div>

            {/* OTP sent — enter code */}
            {otpSent && !phoneVerified && (
              <div className="mt-4 space-y-3">
                <div className="bg-omn-primary/10 border border-omn-primary/30 rounded-lg p-3">
                  <p className="text-sm text-omn-heading font-medium">Code sent!</p>
                  <p className="text-xs text-omn-text mt-0.5">
                    Check your phone for a 6-digit verification code from Firebase.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-omn-text mb-2">Enter 6-digit code</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setOtpError("");
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 px-4 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading font-mono text-lg tracking-[0.3em] text-center focus:border-omn-primary focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpInput.length < 6}
                      className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Verify
                    </button>
                  </div>
                  {otpError && <p className="text-xs text-omn-danger mt-1">{otpError}</p>}
                  <button
                    onClick={() => { setOtpSent(false); setOtpInput(""); setOtpError(""); cleanupRecaptcha(); }}
                    className="text-xs text-omn-text hover:text-omn-heading mt-2 transition-colors"
                  >
                    Change phone number
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpSending}
                    className="text-xs text-omn-primary hover:text-omn-primary-light ml-4 mt-2 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}

            {phoneVerified && (
              <div className="mt-3 flex items-center gap-2 text-omn-success">
                <span className="text-lg">{"\u2713"}</span>
                <span className="text-sm font-medium">Phone verified successfully</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrentStep("passkey")} className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
            <button
              onClick={() => setCurrentStep("ssn")}
              className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors"
            >
              Continue
            </button>
            <button
              onClick={skipToComplete}
              className="px-4 py-2 text-sm text-omn-text hover:text-omn-heading transition-colors"
            >
              Skip remaining steps
            </button>
          </div>
        </div>
      )}

      {/* Step 4: SSN + Age Verification (optional) */}
      {currentStep === "ssn" && (
        <div className="space-y-6">
          {/* Privacy Notice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-omn-success mb-1">On-Chain (Public)</h3>
              <p className="text-[10px] text-omn-text mb-3">Stored on the blockchain</p>
              <ul className="space-y-2 text-sm text-omn-text">
                <li className="flex items-center gap-2"><span className="text-omn-success">+</span>Decentralized Identifier (DID)</li>
                <li className="flex items-center gap-2"><span className="text-omn-success">+</span>Verification proof hash</li>
                <li className="flex items-center gap-2"><span className="text-omn-success">+</span>Verification timestamp</li>
              </ul>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-omn-primary mb-1">Off-Chain (Private Vault)</h3>
              <p className="text-[10px] text-omn-text mb-3">Encrypted on your device only</p>
              <ul className="space-y-2 text-sm text-omn-text">
                <li className="flex items-center gap-2"><span className="text-omn-primary">~</span>SSN (encrypted, device only)</li>
                <li className="flex items-center gap-2"><span className="text-omn-primary">~</span>Full name and address</li>
                <li className="flex items-center gap-2"><span className="text-omn-primary">~</span>Date of birth</li>
              </ul>
            </div>
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-omn-danger mb-1">Never Shared</h3>
              <p className="text-[10px] text-omn-text mb-3">Zero-Knowledge Proofs verify without revealing</p>
              <ul className="space-y-2 text-sm text-omn-text">
                <li className="flex items-center gap-2"><span className="text-omn-danger">x</span>Raw SSN (never on blockchain)</li>
                <li className="flex items-center gap-2"><span className="text-omn-danger">x</span>Your birthday (only "over 21")</li>
                <li className="flex items-center gap-2"><span className="text-omn-danger">x</span>Your address</li>
              </ul>
            </div>
          </div>

          <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-omn-heading">Verify Your Identity</h2>
              <span className="text-xs px-2 py-0.5 bg-omn-border rounded-full text-omn-text">Optional</span>
            </div>
            <p className="text-sm text-omn-text mb-1">
              Enter your SSN to verify your identity using Zero-Knowledge Proofs.
            </p>
            <p className="text-xs text-omn-accent mb-6">
              Your SSN is stored in your encrypted off-chain vault (your device only). A Zero-Knowledge Proof is generated to verify facts like "over 21" without ever revealing the raw SSN. Only a cryptographic hash is stored on-chain — fully GDPR-compliant.
            </p>

            {!verifying && (
              <div>
                <label className="block text-sm text-omn-text mb-2">
                  Social Security Number (use a test SSN below)
                </label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={ssn}
                    onChange={(e) => {
                      setSsn(formatSSN(e.target.value));
                      setSsnError("");
                    }}
                    placeholder="123-45-6789"
                    maxLength={11}
                    className="flex-1 px-4 py-2 bg-omn-bg border border-omn-border rounded-lg text-omn-heading font-mono focus:border-omn-primary focus:outline-none"
                  />
                  <button
                    onClick={handleVerifySSN}
                    disabled={ssn.replace(/\D/g, "").length < 9}
                    className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
                {ssnError && <p className="text-sm text-omn-danger mb-4">{ssnError}</p>}

                {/* Sandbox SSN List */}
                <div className="border-t border-omn-border pt-4 mt-4">
                  <p className="text-xs text-omn-text mb-3">Sandbox test SSNs (click to auto-fill):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sandboxDatabase.map((person) => (
                      <button
                        key={person.ssn}
                        onClick={() => { setSsn(person.ssn); setSsnError(""); }}
                        className="text-left p-3 bg-omn-bg border border-omn-border rounded-lg hover:border-omn-primary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-omn-accent">{person.ssn}</span>
                          <span className="text-xs text-omn-text">Age: {person.age}</span>
                        </div>
                        <p className="text-sm text-omn-heading mt-1">{person.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {verifying && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-omn-text">Generating Zero-Knowledge Proof... (SSN stays in your off-chain vault)</p>
              </div>
            )}

            {/* Age Comparison — shown after SSN is verified */}
            {ssnPerson && !verifying && !ageConfirmed && (
              <div className="mt-6 border-t border-omn-border pt-6">
                <h3 className="text-sm font-semibold text-omn-heading mb-4">Age Verification Result</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* SSN Source */}
                  <div className="bg-omn-bg border border-omn-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-omn-primary/20 rounded flex items-center justify-center text-omn-primary text-[10px] font-bold">ID</div>
                      <span className="text-xs font-medium text-omn-heading">SSN Verification</span>
                    </div>
                    <p className="text-sm text-omn-heading font-medium">{ssnPerson.name}</p>
                    <p className="text-xs text-omn-text mt-1">Birthday: <span className="text-omn-heading font-mono">{ssnPerson.birthdate}</span></p>
                    <p className="text-xs text-omn-text">Age: <span className="text-omn-heading font-bold">{ssnPerson.age}</span></p>
                  </div>
                  {/* Google Source */}
                  <div className="bg-omn-bg border border-omn-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center text-blue-400 text-[10px] font-bold">GO</div>
                      <span className="text-xs font-medium text-omn-heading">Google Account</span>
                    </div>
                    <p className="text-sm text-omn-heading font-medium">{googleUser?.name ?? "Not signed in"}</p>
                    {googleBirthday ? (
                      <>
                        <p className="text-xs text-omn-text mt-1">Birthday: <span className="text-omn-heading font-mono">{googleBirthday}</span></p>
                      </>
                    ) : (
                      <p className="text-xs text-omn-text mt-1 italic">No birthday on file</p>
                    )}
                  </div>
                </div>

                {/* Match / Mismatch indicator */}
                {ageMatch !== null && (
                  <div className={`rounded-lg p-3 mb-4 ${ageMatch ? "bg-omn-success/10 border border-omn-success/30" : "bg-omn-accent/10 border border-omn-accent/30"}`}>
                    {ageMatch ? (
                      <p className="text-sm text-omn-success font-medium">Birthdays match across both sources.</p>
                    ) : (
                      <div>
                        <p className="text-sm text-omn-accent font-medium">Birthdays don't match.</p>
                        <p className="text-xs text-omn-text mt-1">
                          Defaulting to SSN-verified age (<span className="font-bold text-omn-heading">{ssnPerson.age}</span>) as the authoritative source,
                          since government records take priority over self-reported data.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {ageMatch === null && googleBirthday === null && (
                  <div className="bg-omn-surface border border-omn-border rounded-lg p-3 mb-4">
                    <p className="text-xs text-omn-text">
                      No Google birthday to compare. Using SSN-verified age: <span className="font-bold text-omn-heading">{ssnPerson.age}</span>
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirmAge}
                  className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors"
                >
                  Confirm &amp; Complete Setup
                </button>
              </div>
            )}

            {!verifying && !ssnPerson && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCurrentStep("phone")} className="px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
                <button
                  onClick={skipToComplete}
                  className="px-4 py-2 text-sm text-omn-text hover:text-omn-heading transition-colors"
                >
                  Skip — finish setup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {currentStep === "complete" && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-omn-success">{"\u2713"}</span>
          </div>
          <h2 className="text-2xl font-bold text-omn-heading mb-2">Welcome to OmnID!</h2>
          <p className="text-omn-text mb-6">
            {verifiedPerson
              ? "Your unified identity has been created with full verification."
              : "You're signed in and ready to start transferring data between apps."}
          </p>

          {/* OmnID Card Preview */}
          <div className="max-w-sm mx-auto bg-gradient-to-br from-omn-primary/20 to-omn-accent/20 border border-omn-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-omn-heading">
                Omn<span className="text-omn-accent">ID</span>
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                verifiedPerson
                  ? "bg-omn-success/20 text-omn-success"
                  : "bg-omn-primary/20 text-omn-primary"
              }`}>
                {verifiedPerson ? "Verified" : "Active"}
              </span>
            </div>
            {googleUser?.picture && (
              <img src={googleUser.picture} alt="" className="w-16 h-16 rounded-full mx-auto mb-3" referrerPolicy="no-referrer" />
            )}
            <div className="text-left space-y-2">
              {(googleUser || verifiedPerson) && (
                <div>
                  <p className="text-xs text-omn-text">Name</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser?.name ?? verifiedPerson?.name}</p>
                </div>
              )}
              {googleUser?.email && (
                <div>
                  <p className="text-xs text-omn-text">Email</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser.email}</p>
                </div>
              )}
              {googleUser?.birthday && (
                <div>
                  <p className="text-xs text-omn-text">Birthday</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser.birthday}</p>
                </div>
              )}
              {googleUser?.gender && (
                <div>
                  <p className="text-xs text-omn-text">Gender</p>
                  <p className="text-sm font-medium text-omn-heading capitalize">{googleUser.gender}</p>
                </div>
              )}
              {googleUser?.phone && (
                <div>
                  <p className="text-xs text-omn-text">Phone (from Google)</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser.phone}</p>
                </div>
              )}
              {googleUser?.address && (
                <div>
                  <p className="text-xs text-omn-text">Address</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser.address}</p>
                </div>
              )}
              {googleUser?.organization && (
                <div>
                  <p className="text-xs text-omn-text">Organization</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser.organization}{googleUser.jobTitle ? ` — ${googleUser.jobTitle}` : ""}</p>
                </div>
              )}
              {verifiedPerson && (
                <div>
                  <p className="text-xs text-omn-text">Verified Age</p>
                  <p className="text-sm font-medium text-omn-heading">{verifiedPerson.age}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-omn-text">Linked Accounts</p>
                <div className="flex gap-1 mt-1">
                  {linkedProviders.map((p) => (
                    <span key={p} className="text-xs px-2 py-0.5 bg-omn-surface border border-omn-border rounded-full text-omn-text capitalize">{p}</span>
                  ))}
                </div>
              </div>
              {passkeyType && (
                <div>
                  <p className="text-xs text-omn-text">Passkey</p>
                  <p className="text-sm font-medium text-omn-heading capitalize">{passkeyType} Passkey</p>
                </div>
              )}
              {(phoneVerified || googleUser?.phone) && (
                <div>
                  <p className="text-xs text-omn-text">Phone</p>
                  <p className="text-sm font-medium text-omn-heading">{googleUser?.phone || phone}</p>
                </div>
              )}
              {detectedPlatforms.length > 0 && (
                <div>
                  <p className="text-xs text-omn-text">Detected Platforms</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detectedPlatforms.map((p) => (
                      <span key={p.domain} className="text-xs px-2 py-0.5 bg-omn-primary/10 border border-omn-primary/20 rounded-full text-omn-primary">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <a href="/" className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors">Go to Dashboard</a>
            <a href="/accounts" className="px-6 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Connect & Transfer Platforms</a>
          </div>
        </div>
      )}
      {/* Facebook Sign-Up Modal */}
      {fbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleFbClose} />
          <div className="relative bg-omn-surface border border-omn-border rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm font-bold">f</div>
                <span className="text-white font-bold text-lg">Facebook</span>
              </div>
              <button onClick={handleFbClose} className="text-white/60 hover:text-white text-xl transition-colors">&times;</button>
            </div>

            <div className="p-6">
              {fbStep === "form" && (
                <>
                  <h3 className="text-lg font-semibold text-omn-heading mb-1">Create a New Account</h3>
                  <p className="text-xs text-omn-text mb-5">It's quick and easy.</p>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={fbName}
                        onChange={(e) => setFbName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading placeholder:text-omn-text/50 focus:border-omn-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={fbEmail}
                        onChange={(e) => setFbEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading placeholder:text-omn-text/50 focus:border-omn-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={fbPassword}
                        onChange={(e) => setFbPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading placeholder:text-omn-text/50 focus:border-omn-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-omn-text mb-1.5">Birthday</label>
                      <input
                        type="date"
                        value={fbBirthday}
                        onChange={(e) => setFbBirthday(e.target.value)}
                        className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading focus:border-omn-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-omn-text mt-4 leading-relaxed">
                    By clicking Sign Up, you agree to our Terms, Privacy Policy, and Cookies Policy.
                    This is a demo — no real Facebook account will be created.
                  </p>

                  <button
                    onClick={handleFbSignUp}
                    disabled={!fbEmail || !fbPassword || !fbName}
                    className="w-full mt-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {fbStep === "loading" && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-omn-heading">Creating account...</p>
                  <p className="text-xs text-omn-text mt-1">Linking to OmnID</p>
                </div>
              )}

              {fbStep === "done" && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-omn-success">{"\u2713"}</span>
                  </div>
                  <p className="text-sm font-medium text-omn-heading mb-1">Account Created!</p>
                  <p className="text-xs text-omn-text mb-4">Welcome, {fbName}. Your Facebook account is linked to OmnID.</p>
                  <button
                    onClick={handleFbClose}
                    className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg text-sm transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
