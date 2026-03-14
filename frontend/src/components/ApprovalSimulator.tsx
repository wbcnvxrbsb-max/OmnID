import { useState, useEffect } from "react";
import ContentControls from "./ContentControls";
import type {
  ChildAccount,
  PlatformPermission,
  ContentLevel,
} from "../data/parental-controls";
import { getChildAge, getPlatformAgeRule } from "../data/parental-controls";

interface ApprovalSimulatorProps {
  child: ChildAccount;
  platformId: string;
  platformName: string;
  platformColor: string;
  platformIcon: string;
  onApproved: (contentLevel: ContentLevel, permission: PlatformPermission) => void;
  onDenied: () => void;
  onBack: () => void;
}

type Phase = "sending" | "notification" | "controls" | "approved";

export default function ApprovalSimulator({
  child,
  platformId,
  platformName,
  platformColor,
  platformIcon,
  onApproved,
  onDenied,
  onBack,
}: ApprovalSimulatorProps) {
  const [phase, setPhase] = useState<Phase>("sending");
  const [permission, setPermission] = useState<PlatformPermission>({
    platformId,
    allowed: true,
    contentLevel: "restricted",
    spotifyExplicit: false,
    cryptoEnabled: false,
    cardEnabled: false,
  });

  const rule = getPlatformAgeRule(platformId);
  const childAge = getChildAge(child);

  // Simulate sending delay
  useEffect(() => {
    if (phase === "sending") {
      const timer = setTimeout(() => setPhase("notification"), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Sending phase
  if (phase === "sending") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-omn-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="animate-spin w-8 h-8 border-3 border-omn-primary border-t-transparent rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-omn-heading mb-2">Sending request to parent...</h2>
          <p className="text-sm text-omn-text">
            {child.name} wants to sign up for {platformName}
          </p>
        </div>
      </div>
    );
  }

  // Parent notification phase
  if (phase === "notification") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {/* Simulated phone notification */}
          <div className="bg-omn-surface border border-omn-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Phone status bar */}
            <div className="bg-omn-bg px-4 py-2 flex items-center justify-between border-b border-omn-border">
              <span className="text-[10px] text-omn-text">Simulated Parent Device</span>
              <span className="text-[10px] text-omn-text">OmnID Notification</span>
            </div>

            {/* Notification content */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-omn-primary to-omn-accent rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-white">O</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-omn-heading">OmnID Parental Request</p>
                  <p className="text-[10px] text-omn-text">Just now</p>
                </div>
              </div>

              <div className="bg-omn-bg rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: platformColor }}>
                    {platformIcon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-omn-heading">{platformName}</p>
                    <p className="text-[10px] text-omn-text">Age requirement: {rule?.label ?? "N/A"}</p>
                  </div>
                </div>

                <p className="text-sm text-omn-heading mb-1">
                  <strong>{child.name}</strong> wants to sign up for {platformName}.
                </p>
                <p className="text-xs text-omn-text mb-3">
                  {child.name} is <strong className="text-omn-heading">{childAge} years old</strong>.{" "}
                  {platformName} requires age <strong className="text-omn-heading">{rule?.minAge}+</strong>.
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                  <p className="text-xs text-yellow-400">
                    Your approval is required. You will be able to set content restrictions.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onDenied}
                  className="flex-1 py-3 border border-omn-border rounded-xl text-sm font-medium text-omn-text hover:text-omn-heading hover:border-omn-border-light transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => setPhase("controls")}
                  className="flex-1 py-3 bg-omn-success text-white rounded-xl text-sm font-semibold hover:bg-omn-success/90 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>

          <button onClick={onBack} className="w-full text-center text-xs text-omn-text hover:text-omn-heading mt-4 transition-colors">
            {"\u2190"} Back to platforms
          </button>
        </div>
      </div>
    );
  }

  // Content controls phase
  if (phase === "controls") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="bg-omn-surface border border-omn-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-omn-heading mb-1">Set Content Restrictions</h2>
            <p className="text-xs text-omn-text mb-5">
              Configure what {child.name} can access on {platformName}.
            </p>

            <ContentControls
              platformId={platformId}
              permission={permission}
              onChange={setPermission}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPhase("notification")}
                className="flex-1 py-2.5 border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setPhase("approved");
                  setTimeout(() => {
                    onApproved(permission.contentLevel, permission);
                  }, 1200);
                }}
                className="flex-1 py-2.5 bg-omn-success text-white rounded-lg text-sm font-semibold hover:bg-omn-success/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved phase (brief confirmation)
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-omn-success/20 rounded-full flex items-center justify-center text-omn-success text-3xl mx-auto mb-4">
          {"\u2713"}
        </div>
        <h2 className="text-xl font-bold text-omn-heading mb-2">Parent Approved!</h2>
        <p className="text-sm text-omn-text">
          {child.name} can now sign up for {platformName} with {permission.contentLevel} content access.
        </p>
      </div>
    </div>
  );
}
