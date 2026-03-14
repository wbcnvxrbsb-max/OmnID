import { useState } from "react";
import { generateMockProfile, type PlatformProfile } from "../data/sandbox-platforms";
import {
  taxonomy,
  findPlatformById,
  type Cluster,
  type Category,
  type Subcategory,
  type TaxonomyPlatform,
} from "../data/platform-taxonomy";
import { usePersistedState } from "../hooks/usePersistedState";
import { isGoogleConfigured, googleSignIn, getGoogleUser, clearGoogleUser, detectPlatforms, getDetectedPlatforms, type GoogleUser, type DetectedPlatform } from "../google-auth";
import { simulateGitHubLink, getGitHubUser, clearGitHubUser, type GitHubUser } from "../api/github-auth";
import { pushActivity } from "../activity";

// Demo user: Henry Thompson

type DrillLevel = "cluster" | "category" | "subcategory" | "platform";
type ConnectStep = "idle" | "connecting" | "done";
type TransferStep = "idle" | "transferring" | "complete";

export default function LinkedAccounts() {
  const [googleUser, setGoogleUser] = usePersistedState<GoogleUser | null>("google-user", getGoogleUser());
  const [googleLoading, setGoogleLoading] = useState(false);
  const [detectedPlatforms, setDetectedPlatforms] = usePersistedState<DetectedPlatform[]>("detected-platforms", getDetectedPlatforms());
  const [scanning, setScanning] = useState(false);

  // GitHub
  const [githubUser, setGithubUser] = usePersistedState<GitHubUser | null>("github-user", getGitHubUser());

  // Connected platforms (persisted)
  const [connectedProfiles, setConnectedProfiles] = usePersistedState<PlatformProfile[]>("linked-profiles", []);
  const connectedIds = new Set(connectedProfiles.map((p) => p.platformId));

  // Browse taxonomy state
  const [level, setLevel] = useState<DrillLevel>("cluster");
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Connect flow
  const [connectStep, setConnectStep] = useState<ConnectStep>("idle");
  const [connectingName, setConnectingName] = useState("");

  // Auto-transfer state
  const [transferStep, setTransferStep] = useState<TransferStep>("idle");
  const [autoTransferInfo, setAutoTransferInfo] = useState<{
    newPlatform: TaxonomyPlatform;
    sources: PlatformProfile[];
    destCluster: string;
  } | null>(null);
  const [transferHistory, setTransferHistory] = usePersistedState<{
    sourceName: string;
    destName: string;
    rating: number;
    date: string;
  }[]>("transfer-history", []);

  function connectPlatform(taxP: TaxonomyPlatform, subName: string, clusterName?: string) {
    setConnectingName(taxP.name);
    setConnectStep("connecting");
    setTimeout(() => {
      const profile = generateMockProfile(taxP.id, taxP.name, subName, taxP.color, taxP.icon, clusterName);
      setConnectedProfiles((prev) => [...prev, profile]);
      pushActivity(`Connected ${taxP.name}`, taxP.icon.slice(0, 2), taxP.color);

      // Auto-detect related connected platforms for transfer
      const destInfo = findPlatformById(taxP.id);
      if (destInfo) {
        const relevantSources = connectedProfiles.filter((existing) => {
          const srcInfo = findPlatformById(existing.platformId);
          return srcInfo ? srcInfo.cluster === destInfo.cluster : false;
        });
        if (relevantSources.length > 0) {
          setAutoTransferInfo({
            newPlatform: taxP,
            sources: relevantSources,
            destCluster: destInfo.cluster,
          });
          // Auto-transfer immediately — no user intervention needed
          setTransferStep("transferring");
          setTimeout(() => {
            const now = new Date().toISOString().slice(0, 10);
            setTransferHistory((prev) => [
              ...prev,
              ...relevantSources.map((src) => ({
                sourceName: src.platformName,
                destName: taxP.name,
                rating: src.score,
                date: now,
              })),
            ]);
            relevantSources.forEach((src) => {
              pushActivity(`Reputation transferred: ${src.platformName} → ${taxP.name}`, taxP.icon.slice(0, 2), taxP.color);
            });
            setTransferStep("complete");
          }, 2000);
          return; // don't show the normal "done" modal
        }
      }

      setConnectStep("done");
    }, 1500);
  }

  function dismissTransfer() {
    setTransferStep("idle");
    setAutoTransferInfo(null);
    setConnectStep("idle");
  }

  function resetDrill() {
    setLevel("cluster");
    setCluster(null);
    setCategory(null);
    setSubcategory(null);
  }

  function goBack() {
    if (level === "platform") setLevel("subcategory");
    else if (level === "subcategory") { setLevel("category"); setSubcategory(null); }
    else if (level === "category") { setLevel("cluster"); setCategory(null); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Linked Accounts</h1>
      <p className="text-omn-text mb-8">
        Connect your accounts and platforms to build your portable identity. Data auto-transfers between related platforms.
      </p>

      {/* ═══ CONNECT MODAL ═══ */}
      {connectStep === "connecting" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-sm text-center">
            <div className="animate-spin w-10 h-10 border-3 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-omn-heading font-medium">Connecting to {connectingName}...</p>
            <p className="text-xs text-omn-text mt-1">Signing in via OAuth and importing data</p>
          </div>
        </div>
      )}
      {connectStep === "done" && transferStep === "idle" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-sm text-center">
            <div className="w-12 h-12 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-omn-heading font-medium">{connectingName} Connected!</p>
            <p className="text-xs text-omn-text mt-1 mb-4">Reputation data imported successfully</p>
            <button onClick={() => setConnectStep("idle")} className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm">Done</button>
          </div>
        </div>
      )}

      {/* ═══ AUTO-TRANSFER MODAL ═══ */}
      {transferStep === "transferring" && autoTransferInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-md text-center">
            <div className="animate-spin w-10 h-10 border-3 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-omn-heading font-medium">Auto-transferring reputation data...</p>
            <p className="text-xs text-omn-text mt-1">
              {autoTransferInfo.sources.length} related platform{autoTransferInfo.sources.length > 1 ? "s" : ""} {"\u2192"} {autoTransferInfo.newPlatform.name}
            </p>
            <p className="text-xs text-omn-accent mt-2">$1 fee charged to {autoTransferInfo.newPlatform.name} (one-time)</p>
          </div>
        </div>
      )}
      {transferStep === "complete" && autoTransferInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-omn-surface border border-omn-border rounded-xl p-8 max-w-md text-center">
            <div className="w-14 h-14 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-omn-success">{"\u2713"}</span>
            </div>
            <p className="text-xl font-bold text-omn-heading mb-2">{autoTransferInfo.newPlatform.name} Connected!</p>
            <p className="text-sm text-omn-text mb-3">
              Reputation automatically transferred from {autoTransferInfo.sources.length} related platform{autoTransferInfo.sources.length > 1 ? "s" : ""}
            </p>
            <div className="bg-omn-bg rounded-lg p-3 mb-4 text-left space-y-1 text-xs font-mono">
              {autoTransferInfo.sources.map((src) => (
                <p key={src.platformId} className="text-omn-heading">
                  {src.platformName} (score: {src.score}) {"\u2192"} {autoTransferInfo.newPlatform.name}
                </p>
              ))}
              <p className="text-omn-accent pt-1 border-t border-omn-border">
                Fee: $1.00 (charged to {autoTransferInfo.newPlatform.name}, one-time)
              </p>
            </div>
            <p className="text-xs text-omn-text mb-4">
              Only relevant data shared. Personal info stays private.
            </p>
            <button
              onClick={dismissTransfer}
              className="px-6 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* OAuth Providers */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-4">Sign-In Providers</h2>
        <p className="text-xs text-omn-text mb-3">
          Sign in with Google to start transferring data between apps. No full OmnID registration required.
        </p>
        <div className="space-y-3">
          {/* Google — real OAuth */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${googleUser ? "border-omn-success/30 bg-omn-success/5" : "border-omn-border"}`}>
            {googleUser?.picture ? (
              <img src={googleUser.picture} alt="" className="w-10 h-10 rounded-lg shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">GO</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-omn-heading">Google</p>
              {googleUser ? (
                <p className="text-xs text-omn-text truncate">{googleUser.email}</p>
              ) : (
                <p className="text-xs text-omn-text">Not linked</p>
              )}
            </div>
            {googleUser ? (
              <div className="flex items-center gap-2">
                <span className="text-omn-success text-sm">{"\u2713"}</span>
                <button onClick={() => { clearGoogleUser(); setGoogleUser(null); }} className="text-[10px] text-omn-text hover:text-omn-danger">x</button>
              </div>
            ) : (
              <button
                disabled={googleLoading}
                onClick={async () => {
                  if (isGoogleConfigured()) {
                    setGoogleLoading(true);
                    try {
                      const u = await googleSignIn();
                      setGoogleUser(u);
                      pushActivity(`Linked Google account (${u.email})`, "GO", "bg-blue-600");
                      setScanning(true);
                      setDetectedPlatforms([]);
                      try {
                        await detectPlatforms((found) => {
                          setDetectedPlatforms((prev) => [...prev, found]);
                        });
                      } catch { /* best-effort */ }
                      setScanning(false);
                    } catch { /* user closed popup */ }
                    setGoogleLoading(false);
                  }
                }}
                className="text-xs px-3 py-1 bg-omn-primary/20 text-omn-primary rounded-full hover:bg-omn-primary/30 transition-colors disabled:opacity-50"
              >
                {googleLoading ? "..." : "Link"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ═══ DEVELOPER ACCOUNTS ═══ */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-4">Developer Accounts</h2>
        <p className="text-xs text-omn-text mb-3">
          Link your developer profiles to include code contributions in your portable identity.
        </p>
        <div className="space-y-3">
          {/* GitHub */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${githubUser ? "border-omn-success/30 bg-omn-success/5" : "border-omn-border"}`}>
            {githubUser ? (
              <img src={githubUser.avatar_url} alt="" className="w-10 h-10 rounded-lg shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-omn-primary rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">GH</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-omn-heading">GitHub</p>
              {githubUser ? (
                <div>
                  <p className="text-xs text-omn-text truncate">
                    <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className="text-omn-primary hover:text-omn-primary-light transition-colors">
                      @{githubUser.login}
                    </a>
                    {githubUser.bio && <span className="text-omn-text"> — {githubUser.bio}</span>}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-omn-text">
                    <span><span className="text-omn-accent">{githubUser.public_repos}</span> repos</span>
                    <span><span className="text-omn-accent">{githubUser.followers}</span> followers</span>
                    <span><span className="text-omn-accent">{githubUser.following}</span> following</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-omn-text">Not linked</p>
              )}
            </div>
            {githubUser ? (
              <div className="flex items-center gap-2">
                <span className="text-omn-success text-sm">{"\u2713"}</span>
                <button
                  onClick={() => { clearGitHubUser(); setGithubUser(null); }}
                  className="text-[10px] text-omn-text hover:text-omn-danger"
                >x</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const user = simulateGitHubLink();
                  setGithubUser(user);
                  pushActivity(`Linked GitHub (@${user.login})`, "GH", "bg-omn-primary");
                }}
                className="text-xs px-3 py-1 bg-omn-primary/20 text-omn-primary rounded-full hover:bg-omn-primary/30 transition-colors"
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gmail-detected platforms */}
      {(scanning || detectedPlatforms.length > 0) && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-omn-heading mb-1">
            Detected from Gmail
          </h2>
          <p className="text-xs text-omn-text mb-4">
            Platforms found in your Gmail inbox. Connect them to import your data.
          </p>
          {scanning && (
            <div className="flex items-center gap-2 mb-3">
              <div className="animate-spin w-4 h-4 border-2 border-omn-primary border-t-transparent rounded-full" />
              <span className="text-xs text-omn-text">Scanning Gmail...</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {detectedPlatforms.map((p) => {
              const alreadyConnected = connectedIds.has(p.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
              return (
                <div
                  key={p.domain}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    alreadyConnected ? "border-omn-success/30 bg-omn-success/5" : "border-omn-border bg-omn-bg"
                  }`}
                >
                  <span className="text-xs font-bold text-omn-primary bg-omn-primary/10 w-7 h-7 rounded flex items-center justify-center shrink-0">
                    {p.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-omn-heading truncate">{p.name}</p>
                    <p className="text-[10px] text-omn-text">{p.category}</p>
                  </div>
                  {alreadyConnected && <span className="text-omn-success text-xs">{"\u2713"}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transfer History */}
      {transferHistory.length > 0 && (
        <div className="bg-omn-accent/5 border border-omn-accent/20 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-omn-heading mb-2">Auto-Transfers Completed</h3>
          <div className="space-y-1">
            {transferHistory.map((tx, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-omn-heading">{tx.sourceName} {"\u2192"} {tx.destName}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-omn-accent">{tx.rating.toFixed(1)} stars</span>
                  <span className="text-omn-text">$1 fee</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Platforms */}
      {connectedProfiles.length > 0 && (
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">
            Connected Platforms ({connectedProfiles.length})
          </h2>
          <div className="space-y-3">
            {connectedProfiles.map((profile) => (
              <div key={profile.platformId}>
                <button
                  onClick={() => setExpandedPlatform(expandedPlatform === profile.platformId ? null : profile.platformId)}
                  className="w-full flex items-center gap-4 p-4 bg-omn-bg rounded-lg hover:bg-omn-border/30 transition-colors"
                >
                  <div className={`w-10 h-10 ${profile.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {profile.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-omn-heading">{profile.platformName}</span>
                      <span className="text-xs text-omn-text">{profile.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {profile.metrics.slice(0, 3).map((m) => (
                        <span key={m.label} className="text-xs text-omn-text">
                          <span className="text-omn-accent">{m.value}</span>{" "}
                          <span className="text-omn-text/60">{m.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-omn-text text-sm">{expandedPlatform === profile.platformId ? "\u25B2" : "\u25BC"}</span>
                </button>
                {expandedPlatform === profile.platformId && (
                  <div className="mt-2 ml-14 space-y-2 pb-2">
                    <p className="text-xs text-omn-text">
                      Member since {new Date(profile.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    {profile.reviews.slice(0, 3).map((review, i) => (
                      <div key={i} className="bg-omn-surface border border-omn-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-omn-accent">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</span>
                          <span className="text-xs text-omn-text">{review.reviewer}</span>
                        </div>
                        <p className="text-xs text-omn-text">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse & Connect Platforms (4-layer taxonomy) */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-2">
          Connect a Platform
        </h2>
        <p className="text-sm text-omn-text mb-4">
          Browse all platforms and connect to import your reputation data. Related platforms auto-share relevant data.
        </p>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs mb-4 flex-wrap">
          {["All", ...(cluster ? [cluster.name] : []), ...(category ? [category.name] : []), ...(subcategory ? [subcategory.name] : [])].map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-omn-text">{"\u203A"}</span>}
              {i < arr.length - 1 ? (
                <button
                  onClick={() => {
                    if (i === 0) resetDrill();
                    else if (i === 1) { setLevel("category"); setCategory(null); setSubcategory(null); }
                    else if (i === 2) { setLevel("subcategory"); setSubcategory(null); }
                  }}
                  className="text-omn-primary hover:text-omn-primary-light transition-colors"
                >{crumb}</button>
              ) : (
                <span className="text-omn-heading font-medium">{crumb}</span>
              )}
            </span>
          ))}
        </div>

        {/* Layer 1: Clusters */}
        {level === "cluster" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {taxonomy.map((c) => (
              <button
                key={c.name}
                onClick={() => { setCluster(c); setLevel("category"); }}
                className="p-4 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-center"
              >
                <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-white text-xs font-bold mx-auto mb-2`}>{c.icon}</div>
                <p className="text-sm font-medium text-omn-heading">{c.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* Layer 2: Categories */}
        {level === "category" && cluster && (
          <div className="space-y-2">
            {cluster.categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => { setCategory(cat); setLevel("subcategory"); }}
                className="w-full flex items-center gap-3 p-4 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-left"
              >
                <div className={`w-8 h-8 ${cluster.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-70`}>{cluster.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-omn-heading">{cat.name}</p>
                  <p className="text-xs text-omn-text">{cat.subcategories.length} subcategories</p>
                </div>
                <span className="text-omn-primary text-sm">{"\u203A"}</span>
              </button>
            ))}
            <button onClick={goBack} className="mt-3 px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
          </div>
        )}

        {/* Layer 3: Subcategories */}
        {level === "subcategory" && category && (
          <div className="space-y-2">
            {category.subcategories.map((sub) => (
              <button
                key={sub.name}
                onClick={() => { setSubcategory(sub); setLevel("platform"); }}
                className="w-full flex items-center gap-3 p-4 bg-omn-bg rounded-lg border border-omn-border hover:border-omn-primary transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-omn-heading">{sub.name}</p>
                  <p className="text-xs text-omn-text">{sub.platforms.length} platforms</p>
                </div>
                <span className="text-omn-primary text-sm">{"\u203A"}</span>
              </button>
            ))}
            <button onClick={goBack} className="mt-3 px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
          </div>
        )}

        {/* Layer 4: Platforms */}
        {level === "platform" && subcategory && (
          <div className="space-y-2">
            {subcategory.platforms.map((taxP) => {
              const isConnected = connectedIds.has(taxP.id);
              return (
                <div
                  key={taxP.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    isConnected ? "bg-omn-success/5 border-omn-success/30" : "bg-omn-bg border-dashed border-omn-border"
                  }`}
                >
                  <div className={`w-10 h-10 ${taxP.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${isConnected ? "" : "opacity-60"}`}>
                    {taxP.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-omn-heading">{taxP.name}</p>
                    {isConnected ? (
                      <span className="text-xs text-omn-success">Connected</span>
                    ) : (
                      <span className="text-xs text-omn-text">Not connected</span>
                    )}
                  </div>
                  {isConnected ? (
                    <span className="text-omn-success text-sm">{"\u2713"}</span>
                  ) : (
                    <button
                      onClick={() => connectPlatform(taxP, subcategory.name, cluster?.name)}
                      className="text-xs px-3 py-1 bg-omn-primary/20 text-omn-primary rounded-full hover:bg-omn-primary/30 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
            <button onClick={goBack} className="mt-3 px-4 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
