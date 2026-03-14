import { useState, useEffect, useCallback } from "react";
import {
  AVAILABLE_INSTITUTIONS,
  linkBank,
  getLinkedInstitutionIds,
  type PlaidAccount,
  type Institution,
} from "../api/plaid";

interface PlaidLinkProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accounts: PlaidAccount[]) => void;
}

type Step = "select" | "connecting" | "success";

export default function PlaidLink({ isOpen, onClose, onSuccess }: PlaidLinkProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<PlaidAccount[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setSelectedInstitution(null);
      setLinkedAccounts([]);
    }
  }, [isOpen]);

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

  const alreadyLinkedIds = getLinkedInstitutionIds();
  const availableInstitutions = AVAILABLE_INSTITUTIONS.filter(
    (inst) => !alreadyLinkedIds.includes(inst.id)
  );

  function handleSelectInstitution(institution: Institution) {
    setSelectedInstitution(institution);
    setStep("connecting");

    // Simulate 2-second connection delay
    setTimeout(() => {
      const accounts = linkBank(institution.id);
      const justLinked = accounts.filter((a) => a.institutionId === institution.id);
      setLinkedAccounts(justLinked);
      setStep("success");
    }, 2000);
  }

  function handleDone() {
    onSuccess(linkedAccounts);
    onClose();
  }

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
          {/* Step 1: Select Institution */}
          {step === "select" && (
            <div>
              <h3 className="text-lg font-semibold text-omn-heading mb-1">
                Connect your bank
              </h3>
              <p className="text-sm text-omn-text mb-5">
                Select your financial institution to securely link your accounts.
              </p>

              {availableInstitutions.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl text-omn-success">{"\u2713"}</span>
                  </div>
                  <p className="text-sm text-omn-heading font-medium mb-1">All banks linked</p>
                  <p className="text-xs text-omn-text">
                    You have connected all available institutions.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableInstitutions.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => handleSelectInstitution(inst)}
                      className="w-full flex items-center gap-4 p-4 bg-omn-bg rounded-xl border border-omn-border hover:border-omn-primary transition-colors text-left group"
                    >
                      <div
                        className={`w-11 h-11 ${inst.color} rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0`}
                      >
                        {inst.logo}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-omn-heading group-hover:text-omn-primary transition-colors">
                          {inst.name}
                        </p>
                        <p className="text-xs text-omn-text">
                          {inst.accounts.length} account{inst.accounts.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-omn-text group-hover:text-omn-primary transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Connecting */}
          {step === "connecting" && selectedInstitution && (
            <div className="text-center py-8">
              <div
                className={`w-16 h-16 ${selectedInstitution.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-5`}
              >
                {selectedInstitution.logo}
              </div>
              <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-omn-heading font-medium mb-1">
                Connecting to {selectedInstitution.name}...
              </p>
              <p className="text-xs text-omn-text">
                Securely linking your accounts via Plaid
              </p>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && selectedInstitution && (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-omn-success">{"\u2713"}</span>
                </div>
                <p className="text-lg font-semibold text-omn-heading mb-1">Connected!</p>
                <p className="text-sm text-omn-text">
                  Successfully linked {linkedAccounts.length} account{linkedAccounts.length !== 1 ? "s" : ""} from {selectedInstitution.name}
                </p>
              </div>

              <div className="space-y-2 mb-5">
                {linkedAccounts.map((acc) => (
                  <div
                    key={`${acc.institutionId}-${acc.mask}`}
                    className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg border border-omn-border"
                  >
                    <div
                      className={`w-9 h-9 ${acc.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {acc.logo}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-omn-heading">{acc.accountName}</p>
                      <p className="text-xs text-omn-text capitalize">
                        {acc.accountType} {"\u00B7"} ****{acc.mask}
                      </p>
                    </div>
                    <p className="text-sm font-mono text-omn-accent">
                      ${acc.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleDone}
                className="w-full px-6 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white rounded-xl transition-colors text-sm font-medium"
              >
                Done
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
