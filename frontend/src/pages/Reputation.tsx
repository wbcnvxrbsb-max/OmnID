import { useState, useEffect } from "react";
import {
  sandboxPlatformProfiles,
  calculateCompositeScore,
} from "../data/sandbox-platforms";
import {
  sandboxGovernmentRecords,
  getGovernmentSummary,
  calculateGovernmentImpact,
} from "../data/sandbox-government";
import ScoreGauge from "../components/ScoreGauge";

// Demo user: Henry Thompson
const demoSSN = "890-12-3456";
const profiles = sandboxPlatformProfiles[demoSSN] ?? [];
const baseComposite = calculateCompositeScore(profiles);
const govImpact = calculateGovernmentImpact(demoSSN);
const govSummary = getGovernmentSummary(demoSSN);
const govRecords = sandboxGovernmentRecords[demoSSN] ?? [];

export default function Reputation() {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [govScanned, setGovScanned] = useState(false);
  const [govScanning, setGovScanning] = useState(false);

  // Auto-scan government records on page load (simulates daily morning scan)
  useEffect(() => {
    setGovScanning(true);
    const timer = setTimeout(() => {
      setGovScanning(false);
      setGovScanned(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Only factor government impact into score after scan
  const compositeScore = govScanned
    ? Math.max(0, Math.min(100, baseComposite + govImpact * 20))
    : baseComposite;

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">
        Portable Reputation
      </h1>
      <p className="text-omn-text mb-8">
        Your performance record across {profiles.length} platforms — portable
        and verifiable
      </p>

      {/* Composite Score */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-8 mb-8 text-center">
        <h2 className="text-lg font-semibold text-omn-heading mb-4">
          Composite Reputation Score
        </h2>
        <ScoreGauge score={compositeScore} />
        <p className="mt-4 text-sm text-omn-text">
          Weighted average from {profiles.length} platforms{govScanned ? " + government records" : ""}.{" "}
          <span className="text-omn-primary">
            This score follows you everywhere.
          </span>
        </p>
        {govImpact !== 0 && govScanned && (
          <p className="mt-2 text-xs text-omn-text">
            Government record impact: <span className={govImpact > 0 ? "text-omn-success" : "text-omn-danger"}>{govImpact > 0 ? "+" : ""}{govImpact.toFixed(2)}</span> ({govSummary.label})
          </p>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-omn-heading mb-4">
          Platform Breakdown
        </h2>
        <div className="space-y-3">
          {profiles.map((p) => (
            <div key={`${p.platformId}-breakdown`}>
              <button
                onClick={() =>
                  setExpandedPlatform(
                    expandedPlatform === p.platformId ? null : p.platformId
                  )
                }
                className="w-full"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 ${p.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-left">
                        <span className="text-sm font-medium text-omn-heading">
                          {p.platformName}
                        </span>
                        <span className="text-xs text-omn-text ml-2">
                          {p.category}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-omn-accent">
                        {p.score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-omn-text flex-wrap">
                      {p.metrics.slice(0, 3).map((m) => (
                        <span key={m.label}>{m.value} {m.label}</span>
                      ))}
                      <span>
                        Since{" "}
                        {new Date(p.memberSince).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="w-full bg-omn-border rounded-full h-2 mt-2">
                      <div
                        className={`${p.color} rounded-full h-2 transition-all duration-500`}
                        style={{ width: `${p.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {expandedPlatform === p.platformId && (
                <div className="mt-3 ml-14 space-y-2 pb-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {p.metrics.map((m) => (
                      <div key={m.label} className="bg-omn-bg rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-omn-heading">
                          {m.value}
                        </p>
                        <p className="text-xs text-omn-text">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-omn-heading mb-2">
                    Recent Reviews
                  </p>
                  {p.reviews.slice(0, 3).map((review, i) => (
                    <div
                      key={i}
                      className="bg-omn-bg border border-omn-border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-omn-accent">
                          {"★".repeat(review.stars)}
                          {"☆".repeat(5 - review.stars)}
                        </span>
                        <span className="text-xs text-omn-text">
                          {review.reviewer} · {review.date}
                        </span>
                      </div>
                      <p className="text-xs text-omn-text">
                        "{review.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Government & Legal Records */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-omn-heading">
            Government & Legal Records
          </h2>
          {govScanned && (
            <span className={`text-sm font-medium ${govSummary.color}`}>
              {govSummary.label} ({govSummary.positiveCount} positive, {govSummary.negativeCount} negative)
            </span>
          )}
        </div>

        {govScanning && (
          <div className="text-center py-6">
            <div className="animate-spin w-10 h-10 border-3 border-omn-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-omn-heading font-medium">Running daily government scan...</p>
            <p className="text-xs text-omn-text mt-1">Generating Zero-Knowledge Proof against your encrypted off-chain vault</p>
          </div>
        )}

        {govScanned && govRecords.length > 0 && (
          <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-xs text-omn-text">
              Verified via Zero-Knowledge Proof against your encrypted off-chain vault. Your SSN is never exposed.
            </p>
            <span className="text-[10px] px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full whitespace-nowrap">
              Last scanned: today at 6:00 AM
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full whitespace-nowrap">
              Daily auto-scan
            </span>
          </div>
          <div className="space-y-3">
            {govRecords.map((record, i) => {
              const typeColors: Record<string, string> = {
                ticket: "bg-yellow-500",
                criminal: "bg-red-600",
                grant: "bg-green-600",
                license: "bg-blue-600",
                tax: "bg-indigo-600",
              };
              const typeLabels: Record<string, string> = {
                ticket: "Ticket",
                criminal: "Criminal",
                grant: "Grant",
                license: "License",
                tax: "Tax",
              };
              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    record.impact < 0
                      ? "bg-omn-danger/5 border-omn-danger/20"
                      : "bg-omn-success/5 border-omn-success/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${typeColors[record.type]} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5`}>
                      {typeLabels[record.type].slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-omn-heading">{record.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            record.status === "active" ? "bg-omn-primary/20 text-omn-primary" :
                            record.status === "resolved" ? "bg-omn-text/10 text-omn-text" :
                            record.status === "completed" ? "bg-omn-success/20 text-omn-success" :
                            "bg-omn-text/10 text-omn-text"
                          }`}>{record.status}</span>
                        </div>
                        <span className={`text-sm font-mono font-bold ${record.impact >= 0 ? "text-omn-success" : "text-omn-danger"}`}>
                          {record.impact >= 0 ? "+" : ""}{record.impact.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-omn-text">{record.description}</p>
                      <p className="text-xs text-omn-text mt-0.5">{record.date}</p>
                      {record.details && (
                        <p className="text-xs text-omn-text/70 mt-1 italic">{record.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-omn-bg rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-omn-heading">Total Government Impact</span>
            <span className={`text-lg font-bold font-mono ${govImpact >= 0 ? "text-omn-success" : "text-omn-danger"}`}>
              {govImpact >= 0 ? "+" : ""}{govImpact.toFixed(2)}
            </span>
          </div>
          </>
        )}
      </div>

      {/* API Pricing */}
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-omn-heading mb-3">
          Reputation API Pricing
        </h2>
        <p className="text-sm text-omn-text mb-4">
          Apps and platforms can query your OmnID reputation score via smart
          contract. Each query costs 1 USDC.
        </p>
        <div className="bg-omn-bg rounded-lg p-4 font-mono text-sm space-y-2">
          <p className="text-omn-text">
            <span className="text-omn-primary">
              ReputationAggregator
            </span>
            .getScore(user)
          </p>
          <p className="text-omn-accent">
            Fee: 1 USDC per query
          </p>
          <p className="text-omn-text text-xs">
            Returns: composite score (0–100), per-platform breakdown, and
            government impact — your reputation is public and portable
          </p>
        </div>
      </div>
    </div>
  );
}
