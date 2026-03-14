import { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import {
  getLinkToken,
  exchangePublicToken,
  type PlaidAccount,
} from "../api/plaid";

interface PlaidLinkProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accounts: PlaidAccount[]) => void;
}

type Step = "loading" | "ready" | "exchanging" | "success" | "error";

export default function PlaidLink({ isOpen, onClose, onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [linkedAccounts, setLinkedAccounts] = useState<PlaidAccount[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch link token when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep("loading");
    setLinkToken(null);
    setLinkedAccounts([]);
    setErrorMsg("");

    const userId = `omnid-user-${Date.now()}`;
    getLinkToken(userId)
      .then((token) => {
        setLinkToken(token);
        setStep("ready");
      })
      .catch((err) => {
        setErrorMsg(err.message ?? "Failed to get link token");
        setStep("error");
      });
  }, [isOpen]);

  // Handle Plaid Link success callback
  const handlePlaidSuccess = useCallback(
    async (publicToken: string) => {
      setStep("exchanging");
      try {
        const { accounts } = await exchangePublicToken(publicToken);
        setLinkedAccounts(accounts);
        setStep("success");
        onSuccess(accounts);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Exchange failed";
        setErrorMsg(msg);
        setStep("error");
      }
    },
    [onSuccess]
  );

  // Handle Plaid Link exit (user closed the modal)
  const handlePlaidExit = useCallback(() => {
    // Only close if we haven't already started exchanging
    if (step !== "exchanging" && step !== "success") {
      onClose();
    }
  }, [step, onClose]);

  // Initialize usePlaidLink
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: handlePlaidExit,
  });

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-omn-surface border border-omn-border rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-omn-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-omn-heading">Plaid</p>
              <p className="text-[10px] text-omn-text">Sandbox Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-omn-bg text-omn-text hover:text-omn-heading transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Loading state */}
          {step === "loading" && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-omn-heading font-medium mb-1">
                Initializing Plaid Link...
              </p>
              <p className="text-xs text-omn-text">
                Fetching a secure link token
              </p>
            </div>
          )}

          {/* Ready — show button to open Plaid Link */}
          {step === "ready" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-omn-heading mb-1">
                Connect your bank
              </h3>
              <p className="text-sm text-omn-text mb-5">
                Securely link your bank accounts via Plaid. Your credentials are encrypted and never stored by OmnID.
              </p>
              <button
                onClick={() => open()}
                disabled={!ready}
                className="w-full px-6 py-3 bg-omn-primary hover:bg-omn-primary-light disabled:opacity-50 text-white rounded-xl transition-colors text-sm font-medium"
              >
                Open Plaid Link
              </button>
              <p className="text-xs text-omn-text mt-3">
                Sandbox credentials: user_good / pass_good
              </p>
            </div>
          )}

          {/* Exchanging public token */}
          {step === "exchanging" && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-omn-heading font-medium mb-1">
                Linking your accounts...
              </p>
              <p className="text-xs text-omn-text">
                Securely exchanging credentials and fetching account data
              </p>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-omn-success">{"\u2713"}</span>
                </div>
                <p className="text-lg font-semibold text-omn-heading mb-1">Connected!</p>
                <p className="text-sm text-omn-text">
                  Successfully linked {linkedAccounts.length} account{linkedAccounts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2 mb-5">
                {linkedAccounts.map((acc) => (
                  <div
                    key={acc.account_id}
                    className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg border border-omn-border"
                  >
                    <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {acc.type === "depository" ? "BK" : acc.type === "credit" ? "CC" : "AC"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-omn-heading">{acc.name}</p>
                      <p className="text-xs text-omn-text capitalize">
                        {acc.subtype ?? acc.type} {acc.mask ? `\u00B7 ****${acc.mask}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono text-omn-accent">
                        {acc.balances.current != null
                          ? `$${acc.balances.current.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "--"}
                      </p>
                      <p className="text-[10px] text-omn-text">{acc.balances.currency}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white rounded-xl transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-red-400">!</span>
              </div>
              <p className="text-lg font-semibold text-omn-heading mb-1">Something went wrong</p>
              <p className="text-sm text-omn-text mb-5">{errorMsg}</p>
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 bg-omn-surface border border-omn-border hover:bg-omn-bg text-omn-heading rounded-xl transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-omn-border flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-omn-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <p className="text-[10px] text-omn-text">
            Your credentials are encrypted and never stored by OmnID
          </p>
        </div>
      </div>
    </div>
  );
}
