/**
 * SSN-linked government & legal records for OmnID Demo
 *
 * These records are tied to a person's SSN and affect their
 * composite reputation score. Only verified data is shown —
 * the SSN itself is never exposed.
 */

export interface GovernmentRecord {
  type: "ticket" | "criminal" | "grant" | "license" | "tax";
  title: string;
  description: string;
  date: string;
  status: "active" | "resolved" | "completed" | "expired";
  impact: number; // -1.0 to +1.0 on reputation
  details?: string;
}

export const sandboxGovernmentRecords: Record<string, GovernmentRecord[]> = {
  "123-45-6789": [
    // Alice Johnson — minor, no records
  ],
  "234-56-7890": [
    // Bob Chen — minor, clean
  ],
  "345-67-8901": [
    // Carol Martinez — minor, clean
  ],
  "456-78-9012": [
    // David Kim — speeding ticket
    {
      type: "ticket",
      title: "Speeding Violation",
      description: "45 in a 30 mph zone — Seattle, WA",
      date: "2024-08-14",
      status: "resolved",
      impact: -0.1,
      details: "Fine paid: $175. Points removed after traffic school.",
    },
  ],
  "567-89-0123": [
    // Emma Williams — minor, clean
  ],
  "678-90-1234": [
    // Frank Patel — grant recipient
    {
      type: "grant",
      title: "NYC Small Business Grant",
      description: "Awarded $5,000 for small business development",
      date: "2024-03-01",
      status: "completed",
      impact: +0.3,
      details: "Completed all milestones. Business in good standing.",
    },
    {
      type: "license",
      title: "Business License — Active",
      description: "Licensed food cart operator, New York, NY",
      date: "2023-06-15",
      status: "active",
      impact: +0.1,
    },
  ],
  "789-01-2345": [
    // Grace Lee — minor, clean
  ],
  "890-12-3456": [
    // Henry Thompson — the demo user
    // Traffic ticket (minor ding)
    {
      type: "ticket",
      title: "Parking Violation",
      description: "Expired meter — Denver, CO",
      date: "2023-11-02",
      status: "resolved",
      impact: -0.05,
      details: "Fine paid: $50.",
    },
    // Robbery conviction — 4 years prison, significant reputation impact
    {
      type: "criminal",
      title: "Robbery — Felony Conviction",
      description: "Armed robbery of convenience store — Denver, CO",
      date: "2018-04-12",
      status: "resolved",
      impact: -0.8,
      details: "Sentenced to 4 years. Served 2018-2022. Released on good behavior. Completed parole. Record is public.",
    },
    // Government grant post-release (shows rehabilitation)
    {
      type: "grant",
      title: "Colorado Re-Entry Program Grant",
      description: "Awarded $3,500 for workforce re-entry after incarceration",
      date: "2022-09-01",
      status: "completed",
      impact: +0.2,
      details: "Successfully completed workforce training program. Employer-verified placement.",
    },
    // CDL license (positive — shows employment)
    {
      type: "license",
      title: "Commercial Driver's License (CDL)",
      description: "Class B CDL — State of Colorado",
      date: "2023-01-15",
      status: "active",
      impact: +0.1,
      details: "Valid through 2028. Clean driving record since reinstatement.",
    },
    // Tax filing (good standing)
    {
      type: "tax",
      title: "Federal Tax Filing — Good Standing",
      description: "2025 tax year filed and accepted by IRS",
      date: "2026-02-15",
      status: "completed",
      impact: +0.05,
    },
  ],
};

/**
 * Calculate the total reputation impact from government records.
 * Returns a value that adjusts the composite score.
 */
export function calculateGovernmentImpact(ssn: string): number {
  const records = sandboxGovernmentRecords[ssn] ?? [];
  return records.reduce((sum, r) => sum + r.impact, 0);
}

/**
 * Get a summary label for the government record impact.
 */
export function getGovernmentSummary(ssn: string): {
  totalImpact: number;
  positiveCount: number;
  negativeCount: number;
  label: string;
  color: string;
} {
  const records = sandboxGovernmentRecords[ssn] ?? [];
  const totalImpact = records.reduce((sum, r) => sum + r.impact, 0);
  const positiveCount = records.filter((r) => r.impact > 0).length;
  const negativeCount = records.filter((r) => r.impact < 0).length;

  let label: string;
  let color: string;
  if (totalImpact >= 0.3) { label = "Excellent"; color = "text-omn-success"; }
  else if (totalImpact >= 0) { label = "Good"; color = "text-omn-success"; }
  else if (totalImpact >= -0.3) { label = "Fair"; color = "text-omn-accent"; }
  else { label = "Flagged"; color = "text-omn-danger"; }

  return { totalImpact, positiveCount, negativeCount, label, color };
}
