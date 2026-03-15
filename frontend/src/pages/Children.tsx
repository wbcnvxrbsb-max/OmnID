import { useState, useEffect } from "react";
import {
  getParentData,
  checkAutoEjection,
  getChildAge,
  removeChild,
  updateChildPermission,
  PLATFORM_AGE_RULES,
  canChildUsePlatform,
  type ChildAccount,
  type PlatformPermission,
  type ParentData,
} from "../data/parental-controls";
import ContentControls from "../components/ContentControls";
import ChildRegistration from "../components/ChildRegistration";
import { getGoogleUser } from "../google-auth";

const PLATFORM_META: Record<string, { name: string; icon: string; color: string }> = {
  facebook:  { name: "Facebook",  icon: "f",  color: "#1877F2" },
  uber:      { name: "Uber",      icon: "U",  color: "#000000" },
  doordash:  { name: "DoorDash",  icon: "DD", color: "#FF3008" },
  airbnb:    { name: "Airbnb",    icon: "A",  color: "#FF385C" },
  linkedin:  { name: "LinkedIn",  icon: "in", color: "#0A66C2" },
  instacart: { name: "Instacart", icon: "IC", color: "#003D29" },
  spotify:   { name: "Spotify",   icon: "S",  color: "#1DB954" },
  coinbase:  { name: "Coinbase",  icon: "CB", color: "#0052FF" },
};

export default function Children() {
  const [parentData, setParentData] = useState<ParentData>(getParentData());
  const [registering, setRegistering] = useState(false);
  const [managingChildId, setManagingChildId] = useState<string | null>(null);
  const googleUser = getGoogleUser();

  // Check for auto-ejection on mount
  useEffect(() => {
    const updated = checkAutoEjection(parentData);
    if (updated !== parentData) setParentData(updated);
  }, []);

  function refresh() {
    setParentData(getParentData());
  }

  const managingChild = parentData.children.find((c) => c.id === managingChildId) ?? null;
  const pendingRequests = parentData.approvalRequests.filter((r) => r.status === "pending");

  if (!googleUser) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-omn-heading mb-2">Children's Panel</h1>
        <p className="text-omn-text mb-8">Sign in with Google first to manage child accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Children's Panel</h1>
      <p className="text-omn-text mb-8">Register and manage child accounts linked to your OmnID</p>

      {/* Registration wizard */}
      {registering && (
        <div className="mb-8">
          <ChildRegistration
            onComplete={() => {
              setRegistering(false);
              refresh();
            }}
            onCancel={() => setRegistering(false)}
          />
        </div>
      )}

      {/* Managing a specific child */}
      {managingChild && !registering && (
        <ChildManager
          child={managingChild}
          onBack={() => {
            setManagingChildId(null);
            refresh();
          }}
          onRemove={() => {
            removeChild(managingChild.id);
            setManagingChildId(null);
            refresh();
          }}
        />
      )}

      {/* Main view */}
      {!registering && !managingChild && (
        <>
          {/* Pending approvals */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-omn-heading mb-3">Pending Approvals</h2>
              <div className="space-y-2">
                {pendingRequests.map((req) => {
                  const child = parentData.children.find((c) => c.id === req.childId);
                  const meta = PLATFORM_META[req.platformId];
                  return (
                    <div key={req.id} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {meta && (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: meta.color }}>
                            {meta.icon}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-omn-heading">
                            {child?.name ?? "Child"} wants to use {meta?.name ?? req.platformId}
                          </p>
                          <p className="text-xs text-omn-text">
                            {new Date(req.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (child) setManagingChildId(child.id);
                        }}
                        className="text-xs text-omn-primary hover:text-omn-primary-light transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Children list */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-omn-heading">
              Registered Children ({parentData.children.length})
            </h2>
            <button
              onClick={() => setRegistering(true)}
              className="px-4 py-2 bg-omn-primary text-white rounded-lg text-sm font-medium hover:bg-omn-primary-light transition-colors"
            >
              + Register a Child
            </button>
          </div>

          {parentData.children.length === 0 ? (
            <div className="bg-omn-surface border border-omn-border rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-omn-primary/20 rounded-full flex items-center justify-center text-omn-primary text-xl mx-auto mb-3">
                CH
              </div>
              <p className="text-sm text-omn-heading font-medium mb-1">No children registered</p>
              <p className="text-xs text-omn-text mb-4">
                Register a child to manage their platform access and content controls.
              </p>
              <button
                onClick={() => setRegistering(true)}
                className="px-5 py-2 bg-omn-primary text-white rounded-lg text-sm font-medium hover:bg-omn-primary-light transition-colors"
              >
                Register Your First Child
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentData.children.map((child) => {
                const age = getChildAge(child);
                const approvedCount = child.platformPermissions.filter((p) => p.allowed).length;
                const childPending = parentData.approvalRequests.filter(
                  (r) => r.childId === child.id && r.status === "pending"
                ).length;

                return (
                  <div key={child.id} className="bg-omn-surface border border-omn-border rounded-xl p-5 hover:border-omn-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-omn-primary/20 to-omn-accent/20 rounded-full flex items-center justify-center text-omn-primary text-sm font-bold">
                          {child.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-omn-heading">{child.name}</p>
                          <p className="text-xs text-omn-text">Age {age}</p>
                        </div>
                      </div>
                      {childPending > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded-full">
                          {childPending} pending
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-xs text-omn-text mb-4">
                      <span>{approvedCount} platforms approved</span>
                      {age === 17 && (
                        <span className="text-omn-accent">Turning 18 soon</span>
                      )}
                    </div>

                    <button
                      onClick={() => setManagingChildId(child.id)}
                      className="w-full py-2 border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading hover:border-omn-primary/30 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Child Manager — expanded settings for a single child               */
/* ------------------------------------------------------------------ */

function ChildManager({
  child,
  onBack,
  onRemove,
}: {
  child: ChildAccount;
  onBack: () => void;
  onRemove: () => void;
}) {
  const age = getChildAge(child);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-omn-text hover:text-omn-heading mb-4 transition-colors">
        {"\u2190"} Back to children
      </button>

      {/* Child header */}
      <div className="bg-gradient-to-br from-omn-primary/10 via-omn-surface to-omn-accent/10 border border-omn-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-omn-primary/30 to-omn-accent/30 rounded-full flex items-center justify-center text-omn-primary font-bold">
            {child.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-omn-heading">{child.name}</p>
              <span className="text-[10px] px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Child Account</span>
            </div>
            <p className="text-sm text-omn-text">
              Age {age} | Born: {child.birthdate}
              {age === 17 && <span className="text-omn-accent ml-2">Auto-graduates at 18</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Platform permissions */}
      <h3 className="text-lg font-semibold text-omn-heading mb-4">Platform Permissions</h3>
      <div className="space-y-3 mb-8">
        {PLATFORM_AGE_RULES.map((rule) => {
          const meta = PLATFORM_META[rule.platformId];
          if (!meta) return null;

          const status = canChildUsePlatform(child, rule.platformId);
          const perm = child.platformPermissions.find((p) => p.platformId === rule.platformId);
          const [expanded, setExpanded] = useState(false);

          return (
            <div key={rule.platformId} className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-omn-bg/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-omn-heading">{meta.name}</p>
                    <p className="text-[10px] text-omn-text">Requires: {rule.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === "allowed" && !perm?.allowed && age >= rule.minAge && (
                    <span className="text-[10px] px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full">Meets age</span>
                  )}
                  {perm?.allowed && (
                    <span className="text-[10px] px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full">
                      Approved ({perm.contentLevel})
                    </span>
                  )}
                  {status === "needs_consent" && !perm?.allowed && (
                    <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">Needs consent</span>
                  )}
                  {status === "parent_blocked" && (
                    <span className="text-[10px] px-2 py-0.5 bg-omn-danger/20 text-omn-danger rounded-full">You blocked</span>
                  )}
                  {status === "blocked" && (
                    <span className="text-[10px] px-2 py-0.5 bg-omn-danger/20 text-omn-danger rounded-full">Blocked</span>
                  )}
                  <span className="text-omn-text text-xs">{expanded ? "\u25B2" : "\u25BC"}</span>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-omn-border p-4">
                  {status === "blocked" ? (
                    <p className="text-xs text-omn-text">
                      {meta.name} requires users to be {rule.minAge}+. {child.name} is under this age. OmnID cannot override platform age requirements.
                    </p>
                  ) : (
                    <div>
                      {/* Allow/block toggle */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-medium text-omn-heading">Allow {meta.name}</p>
                        <button
                          onClick={() => {
                            const newPerm: PlatformPermission = perm
                              ? { ...perm, allowed: !perm.allowed }
                              : {
                                  platformId: rule.platformId,
                                  allowed: true,
                                  contentLevel: "restricted",
                                };
                            updateChildPermission(child.id, newPerm);
                            // Force re-read
                            child.platformPermissions = getParentData().children.find(
                              (c) => c.id === child.id
                            )?.platformPermissions ?? child.platformPermissions;
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            perm?.allowed ? "bg-omn-success" : "bg-omn-border"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              perm?.allowed ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content controls when allowed */}
                      {perm?.allowed && (
                        <ContentControls
                          platformId={rule.platformId}
                          permission={perm}
                          onChange={(updated) => {
                            updateChildPermission(child.id, updated);
                            child.platformPermissions = getParentData().children.find(
                              (c) => c.id === child.id
                            )?.platformPermissions ?? child.platformPermissions;
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Crypto / Virtual Card controls */}
      <h3 className="text-lg font-semibold text-omn-heading mb-4">Crypto & Virtual Card</h3>
      <div className="bg-omn-surface border border-omn-border rounded-xl p-4 mb-8">
        <p className="text-xs text-omn-text mb-3">
          Control whether {child.name} can trade crypto or use the OmnID virtual card.
        </p>
        <ContentControls
          platformId="coinbase"
          permission={
            child.platformPermissions.find((p) => p.platformId === "coinbase") ?? {
              platformId: "coinbase",
              allowed: false,
              contentLevel: "restricted",
              cryptoEnabled: false,
              cardEnabled: false,
            }
          }
          onChange={(updated) => {
            updateChildPermission(child.id, updated);
          }}
        />
      </div>

      {/* Remove child */}
      <div className="border-t border-omn-border pt-6">
        {confirmRemove ? (
          <div className="bg-omn-danger/10 border border-omn-danger/20 rounded-xl p-4">
            <p className="text-sm text-omn-heading mb-3">
              Remove {child.name}'s child account? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(false)}
                className="flex-1 py-2 border border-omn-border rounded-lg text-sm text-omn-text"
              >
                Cancel
              </button>
              <button
                onClick={onRemove}
                className="flex-1 py-2 bg-omn-danger text-white rounded-lg text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmRemove(true)}
            className="text-sm text-omn-danger hover:text-omn-danger/80 transition-colors"
          >
            Remove child account
          </button>
        )}
      </div>
    </div>
  );
}
