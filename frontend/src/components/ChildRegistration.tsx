import { useState } from "react";
import { sandboxDatabase } from "../data/sandbox-ssn";
import {
  addChild,
  calculateAge,
  getParentData,
  type ChildAccount,
} from "../data/parental-controls";

interface ChildRegistrationProps {
  onComplete: (child: ChildAccount) => void;
  onCancel: () => void;
}

type Step = "info" | "ssn" | "complete";

export default function ChildRegistration({ onComplete, onCancel }: ChildRegistrationProps) {
  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [ssn, setSsn] = useState("");
  const [ssnError, setSsnError] = useState("");
  const [createdChild, setCreatedChild] = useState<ChildAccount | null>(null);

  const age = birthdate ? calculateAge(birthdate) : null;
  const ageValid = age !== null && age >= 0 && age <= 17;

  function handleInfoNext() {
    if (!name.trim() || !birthdate || !ageValid) return;
    setStep("ssn");
  }

  function formatSSN(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  function handleSSNVerify() {
    setSsnError("");
    const formatted = formatSSN(ssn);
    const person = sandboxDatabase.find((p) => p.ssn === formatted);

    if (!person) {
      setSsnError("SSN not found in sandbox database. Try: 123-45-6789 (Alice, age 12)");
      return;
    }

    if (person.age >= 18) {
      setSsnError(`${person.name} is ${person.age} years old — must be under 18 for a child account.`);
      return;
    }

    // Check if already registered
    const data = getParentData();
    const alreadyRegistered = data.children.some(
      (c) => c.name === person.name && c.birthdate === person.birthdate
    );
    if (alreadyRegistered) {
      setSsnError(`${person.name} is already registered as a child account.`);
      return;
    }

    const child: ChildAccount = {
      id: `child-${Date.now()}`,
      name: person.name,
      birthdate: person.birthdate,
      registeredAt: Date.now(),
      platformPermissions: [],
    };

    addChild(child);
    setCreatedChild(child);
    setStep("complete");
  }

  return (
    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["info", "ssn", "complete"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? "bg-omn-primary text-white"
                  : i < ["info", "ssn", "complete"].indexOf(step)
                  ? "bg-omn-success text-white"
                  : "bg-omn-border text-omn-text"
              }`}
            >
              {i < ["info", "ssn", "complete"].indexOf(step) ? "\u2713" : i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-omn-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === "info" && (
        <div>
          <h3 className="text-lg font-semibold text-omn-heading mb-1">Register a Child</h3>
          <p className="text-xs text-omn-text mb-5">
            Create a child account linked to your OmnID. Child must be 17 or younger.
          </p>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs text-omn-text mb-1">Child's full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alice Johnson"
                className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading placeholder:text-omn-text/40 focus:outline-none focus:border-omn-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-omn-text mb-1">Date of birth</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading focus:outline-none focus:border-omn-primary"
              />
              {age !== null && (
                <p className={`text-xs mt-1 ${ageValid ? "text-omn-success" : "text-omn-danger"}`}>
                  {ageValid
                    ? `Age: ${age} — eligible for child account`
                    : age >= 18
                    ? `Age: ${age} — must be 17 or younger`
                    : "Invalid date"}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">
              Cancel
            </button>
            <button
              onClick={handleInfoNext}
              disabled={!name.trim() || !ageValid}
              className="flex-1 py-2.5 bg-omn-primary text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-omn-primary-light transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: SSN Verification */}
      {step === "ssn" && (
        <div>
          <h3 className="text-lg font-semibold text-omn-heading mb-1">Verify Child's Identity</h3>
          <p className="text-xs text-omn-text mb-5">
            Enter the child's SSN for age verification. SSN never leaves your device.
          </p>

          <div className="mb-4">
            <label className="block text-xs text-omn-text mb-1">Social Security Number</label>
            <input
              value={ssn}
              onChange={(e) => {
                setSsn(formatSSN(e.target.value));
                setSsnError("");
              }}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className="w-full px-4 py-2.5 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading font-mono placeholder:text-omn-text/40 focus:outline-none focus:border-omn-primary"
            />
            {ssnError && <p className="text-xs text-omn-danger mt-1">{ssnError}</p>}
          </div>

          <div className="bg-omn-bg border border-omn-border rounded-lg p-3 mb-4">
            <p className="text-[10px] text-omn-text leading-relaxed">
              <strong className="text-omn-heading">Demo SSNs for children:</strong>{" "}
              123-45-6789 (Alice, 12) | 234-56-7890 (Bob, 16) | 345-67-8901 (Carol, 15) | 567-89-0123 (Emma, 11) | 789-01-2345 (Grace, 13)
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("info")} className="flex-1 py-2.5 border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">
              Back
            </button>
            <button
              onClick={handleSSNVerify}
              disabled={ssn.replace(/\D/g, "").length !== 9}
              className="flex-1 py-2.5 bg-omn-primary text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-omn-primary-light transition-colors"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && createdChild && (
        <div className="text-center">
          <div className="w-14 h-14 bg-omn-success/20 rounded-full flex items-center justify-center text-omn-success text-2xl mx-auto mb-4">
            {"\u2713"}
          </div>
          <h3 className="text-lg font-semibold text-omn-heading mb-1">Child Account Created</h3>
          <p className="text-sm text-omn-text mb-5">
            {createdChild.name} (age {calculateAge(createdChild.birthdate)}) has been added to your OmnID.
          </p>

          {/* Mini OmnID card */}
          <div className="bg-gradient-to-br from-omn-primary/10 via-omn-surface to-omn-accent/10 border border-omn-border rounded-xl p-4 mb-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-omn-heading">
                Omn<span className="text-omn-accent">ID</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Child</span>
            </div>
            <p className="text-sm font-medium text-omn-heading">{createdChild.name}</p>
            <p className="text-xs text-omn-text">Age: {calculateAge(createdChild.birthdate)} | Born: {createdChild.birthdate}</p>
            <p className="text-xs text-omn-text">Platforms: 0 approved | Content: Restricted (default)</p>
          </div>

          <button
            onClick={() => onComplete(createdChild)}
            className="w-full py-2.5 bg-omn-primary text-white rounded-lg text-sm font-medium hover:bg-omn-primary-light transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
