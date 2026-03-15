import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sandboxPlatformProfiles, calculateCompositeScore } from "../data/sandbox-platforms";
import ScoreGauge from "../components/ScoreGauge";
import { getActivity, formatTimeAgo, type ActivityEvent } from "../activity";
import { getGoogleUser } from "../google-auth";
import { getParentData } from "../data/parental-controls";
import { deleteUserData, stopAutoSync } from "../api/firestore";
import { clearPasskey } from "../api/passkeys";
import { API_BASE } from "../api/config";

// Demo user: Henry Thompson (890-12-3456) - most complete profile
const demoSSN = "890-12-3456";
const demoProfiles = sandboxPlatformProfiles[demoSSN] ?? [];
const compositeScore = calculateCompositeScore(demoProfiles);

export default function Dashboard() {
  const [activity, setActivity] = useState<ActivityEvent[]>(getActivity());
  const googleUser = getGoogleUser();

  // Listen for new activity events
  useEffect(() => {
    function refresh() { setActivity(getActivity()); }
    window.addEventListener("omnid-activity", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("omnid-activity", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Read persisted counts from localStorage
  const linkedProfiles: unknown[] = JSON.parse(localStorage.getItem("omnid-linked-profiles") ?? "[]");
  const payMethods: unknown[] = JSON.parse(localStorage.getItem("omnid-pay-methods") ?? "[]");
  const transferHistory: unknown[] = JSON.parse(localStorage.getItem("omnid-transfer-history") ?? "[]");
  const providers: string[] = JSON.parse(localStorage.getItem("omnid-reg-providers") ?? "[]");
  const parentData = getParentData();
  const childCount = parentData.children.length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Dashboard</h1>
      <p className="text-omn-text mb-8">Your unified identity at a glance</p>

      {/* Identity Card + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-omn-primary/10 via-omn-surface to-omn-accent/10 gradient-animate border border-omn-border rounded-xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.06)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-omn-heading">Omn<span className="text-omn-accent">ID</span></span>
                <span className="text-xs px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full">Active</span>
              </div>
              <p className="text-2xl font-bold text-omn-heading">{googleUser?.name ?? "Guest"}</p>
              <p className="text-sm text-omn-text">{googleUser?.email ?? "Sign in to get started"}</p>
            </div>
            <ScoreGauge score={compositeScore} size="sm" />
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-omn-text">{linkedProfiles.length} platforms linked</span>
            <span className="text-omn-text">{providers.length} OAuth accounts</span>
            <span className="text-omn-text">{payMethods.length} payment methods</span>
          </div>
        </div>

        {/* Passive Income */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-omn-heading mb-3">Passive Income</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-[8px] font-bold">GR</span>
                <span className="text-xs text-omn-text">Grass</span>
              </div>
              <span className="text-xs font-mono text-omn-success">$12.40 / mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">EA</span>
                <span className="text-xs text-omn-text">EarnApp</span>
              </div>
              <span className="text-xs font-mono text-omn-success">$8.75 / mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-white text-[8px] font-bold">RE</span>
                <span className="text-xs text-omn-text">Repocket</span>
              </div>
              <span className="text-xs font-mono text-omn-success">$5.20 / mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center text-white text-[8px] font-bold">HN</span>
                <span className="text-xs text-omn-text">Honeygain</span>
              </div>
              <span className="text-xs font-mono text-omn-success">$6.30 / mo</span>
            </div>
            <div className="border-t border-omn-border pt-2 flex items-center justify-between">
              <span className="text-xs font-medium text-omn-heading">Total</span>
              <span className="text-sm font-bold font-mono text-omn-accent">$32.65 / mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Linked Accounts", value: (linkedProfiles.length + providers.length).toString(), color: "text-omn-primary", link: "/accounts" },
          { label: "Reputation Score", value: compositeScore.toFixed(1), color: "text-omn-accent", link: "/reputation" },
          { label: "Payment Methods", value: payMethods.length.toString(), color: "text-omn-success", link: "/payments" },
          { label: "Auto-Transfers", value: transferHistory.length.toString(), color: "text-omn-primary-light", link: "/accounts" },
          ...(childCount > 0 ? [{ label: "Children", value: childCount.toString(), color: "text-omn-pro", link: "/children" }] : []),
        ].map((stat) => (
          <Link key={stat.label} to={stat.link} className="bg-omn-surface border border-omn-border rounded-xl p-5 card-hover">
            <p className="text-omn-text text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/accounts" className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors">
              <div className="w-8 h-8 bg-omn-primary/20 rounded-lg flex items-center justify-center text-omn-primary text-sm">+</div>
              <div>
                <p className="text-sm font-medium text-omn-heading">Link New Account</p>
                <p className="text-xs text-omn-text">Connect Google or a gig platform</p>
              </div>
            </Link>
            <Link to="/accounts" className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors">
              <div className="w-8 h-8 bg-omn-accent/20 rounded-lg flex items-center justify-center text-omn-accent text-sm">{"\u2192"}</div>
              <div>
                <p className="text-sm font-medium text-omn-heading">Connect & Transfer</p>
                <p className="text-xs text-omn-text">Connecting auto-transfers relevant data</p>
              </div>
            </Link>
            <Link to="/payments" className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors">
              <div className="w-8 h-8 bg-omn-success/20 rounded-lg flex items-center justify-center text-omn-success text-sm">$</div>
              <div>
                <p className="text-sm font-medium text-omn-heading">Bridge Payment</p>
                <p className="text-xs text-omn-text">Use digital wallets where only cards work</p>
              </div>
            </Link>
            <Link to="/children" className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors">
              <div className="w-8 h-8 bg-omn-pro/20 rounded-lg flex items-center justify-center text-omn-pro text-sm">CH</div>
              <div>
                <p className="text-sm font-medium text-omn-heading">Children</p>
                <p className="text-xs text-omn-text">Register and manage child accounts</p>
              </div>
            </Link>
            <Link to="/course" className="flex items-center gap-3 p-3 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors">
              <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center text-yellow-500 text-sm">A</div>
              <div>
                <p className="text-sm font-medium text-omn-heading">OmnID Academy</p>
                <p className="text-xs text-omn-text">Learn Web3, blockchain, and digital identity</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity — real events */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-omn-text text-center py-6">No activity yet. Start by signing in with Google or connecting a platform.</p>
            ) : (
              activity.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2">
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-omn-heading truncate">{item.action}</p>
                    <p className="text-xs text-omn-text">{formatTimeAgo(item.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right to Correct — info note */}
      <div className="mt-12 bg-omn-surface border border-omn-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">Update Your Information</h2>
        <p className="text-sm text-omn-text">
          To update your information, sign out and re-register with updated details, or contact{" "}
          <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors underline">
            privacy@omnid.app
          </a>.
        </p>
      </div>

      {/* Your Data — Export / Portability */}
      <div className="mt-6 bg-omn-surface border border-omn-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">Your Data</h2>
        <p className="text-sm text-omn-text mb-4">
          Download a copy of all your OmnID data stored on this device. This fulfills your right to data portability under GDPR and your right to know under CCPA.
        </p>
        <button
          onClick={() => {
            const data: Record<string, unknown> = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith("omnid-")) {
                try {
                  data[key] = JSON.parse(localStorage.getItem(key)!);
                } catch {
                  data[key] = localStorage.getItem(key);
                }
              }
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "omnid-data-export.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-5 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white text-sm font-medium rounded-lg transition-colors"
        >
          Download My Data
        </button>
      </div>

      {/* Danger Zone — Delete My Data */}
      <div className="mt-12 border border-red-500/40 rounded-xl p-6 bg-red-500/5">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Delete My Data</h2>
        <p className="text-sm text-omn-text mb-4">
          This will permanently delete all your OmnID data from this device, the cloud, and deactivate your on-chain identity. This cannot be undone.
        </p>
        <button
          onClick={async () => {
            const ok = window.confirm(
              "Are you sure you want to delete ALL your OmnID data? This cannot be undone."
            );
            if (!ok) return;

            // Stop any active Firestore syncing first
            stopAutoSync();

            // Delete Firestore document if user is signed in
            const user = getGoogleUser();
            if (user?.email) {
              try {
                await deleteUserData(user.email);
              } catch (err) {
                console.warn("Failed to delete Firestore data:", err);
              }

              // Deactivate on-chain identity (best effort)
              try {
                await fetch(`${API_BASE}/api/deactivate-identity`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: user.email }),
                });
              } catch {
                /* best effort */
              }
            }

            // Clear all omnid-* keys from localStorage
            const keysToRemove = Object.keys(localStorage).filter((k) =>
              k.startsWith("omnid-")
            );
            keysToRemove.forEach((k) => localStorage.removeItem(k));

            // Remove passkeys
            clearPasskey();

            // Full page redirect to registration
            window.location.href = "/register";
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Delete Everything
        </button>
      </div>
    </div>
  );
}
