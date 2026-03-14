/**
 * Sandbox Platform Database for OmnID Demo
 *
 * FAKE platform profiles for demo/testing purposes only.
 * Each platform now generates CONTEXT-APPROPRIATE metrics
 * based on which cluster it belongs to in the taxonomy.
 */

export interface PlatformReview {
  text: string;
  stars: number;
  date: string;
  reviewer: string;
}

export interface PlatformMetric {
  label: string;
  value: string;
  numericValue: number; // for scoring
}

export interface PlatformProfile {
  platformId: string;
  platformName: string;
  category: string; // subcategory name from taxonomy
  cluster: string; // cluster name from taxonomy
  score: number; // 0-100 normalized universal score
  metrics: PlatformMetric[];
  memberSince: string;
  reviews: PlatformReview[];
  color: string;
  icon: string;
}

// ─── Cluster-specific metric definitions ───
interface ClusterMetricDef {
  metrics: { label: string; min: number; max: number; format: (v: number) => string }[];
  reviewTemplates: { text: string; stars: number }[];
}

const clusterMetrics: Record<string, ClusterMetricDef> = {
  "Work & Gig Economy": {
    metrics: [
      { label: "Rating", min: 35, max: 50, format: (v) => `${(v / 10).toFixed(1)} / 5.0` },
      { label: "Jobs Completed", min: 50, max: 5000, format: (v) => v.toLocaleString() },
      { label: "On-Time Rate", min: 85, max: 99, format: (v) => `${v}%` },
      { label: "Acceptance Rate", min: 75, max: 98, format: (v) => `${v}%` },
    ],
    reviewTemplates: [
      { text: "Fast and reliable worker. Highly recommend!", stars: 5 },
      { text: "Professional and courteous service.", stars: 5 },
      { text: "Job done right, no complaints.", stars: 4 },
      { text: "Solid performance, minor delay.", stars: 4 },
      { text: "Exceeded expectations!", stars: 5 },
    ],
  },
  "Business & Finance": {
    metrics: [
      { label: "Account Standing", min: 80, max: 100, format: (v) => v >= 90 ? "Excellent" : "Good" },
      { label: "Transactions", min: 50, max: 5000, format: (v) => v.toLocaleString() },
      { label: "Account Age", min: 1, max: 15, format: (v) => `${v} years` },
      { label: "Verification Level", min: 1, max: 3, format: (v) => v === 3 ? "Full" : v === 2 ? "Enhanced" : "Basic" },
    ],
    reviewTemplates: [
      { text: "Trustworthy and reliable partner.", stars: 5 },
      { text: "Great transaction history, no disputes.", stars: 5 },
      { text: "Consistent and professional.", stars: 4 },
      { text: "Good standing, responsive communication.", stars: 4 },
    ],
  },
  "Shopping & Retail": {
    metrics: [
      { label: "Orders", min: 10, max: 2000, format: (v) => v.toLocaleString() },
      { label: "Total Spent", min: 200, max: 50000, format: (v) => `$${v.toLocaleString()}` },
      { label: "Return Rate", min: 1, max: 15, format: (v) => `${v}%` },
      { label: "Seller Rating", min: 38, max: 50, format: (v) => `${(v / 10).toFixed(1)} / 5.0` },
    ],
    reviewTemplates: [
      { text: "Great buyer, fast payment!", stars: 5 },
      { text: "Smooth transaction, would sell to again.", stars: 5 },
      { text: "Reliable customer, no issues.", stars: 4 },
      { text: "Good communication throughout.", stars: 4 },
    ],
  },
  "Food & Dining": {
    metrics: [
      { label: "Visits", min: 5, max: 500, format: (v) => v.toLocaleString() },
      { label: "Loyalty Points", min: 100, max: 25000, format: (v) => v.toLocaleString() },
      { label: "Average Spend", min: 8, max: 75, format: (v) => `$${v}` },
      { label: "Loyalty Tier", min: 1, max: 4, format: (v) => ["Bronze", "Silver", "Gold", "Platinum"][v - 1] },
    ],
    reviewTemplates: [
      { text: "Regular customer, always pleasant!", stars: 5 },
      { text: "Loyal patron, great tipper.", stars: 5 },
      { text: "Frequent visitor, valued customer.", stars: 4 },
    ],
  },
  "Rewards & Loyalty": {
    metrics: [
      { label: "Points Earned", min: 500, max: 100000, format: (v) => v.toLocaleString() },
      { label: "Cashback Earned", min: 10, max: 5000, format: (v) => `$${v.toLocaleString()}` },
      { label: "Redemptions", min: 5, max: 200, format: (v) => v.toLocaleString() },
      { label: "Tier", min: 1, max: 4, format: (v) => ["Member", "Silver", "Gold", "Diamond"][v - 1] },
    ],
    reviewTemplates: [
      { text: "Active member, consistently earns and redeems.", stars: 5 },
      { text: "Engaged user, high activity.", stars: 4 },
    ],
  },
  "Transportation": {
    metrics: [
      { label: "Trips", min: 10, max: 1000, format: (v) => v.toLocaleString() },
      { label: "Miles Traveled", min: 50, max: 25000, format: (v) => v.toLocaleString() },
      { label: "Rating", min: 38, max: 50, format: (v) => `${(v / 10).toFixed(1)} / 5.0` },
      { label: "On-Time Pickups", min: 80, max: 99, format: (v) => `${v}%` },
    ],
    reviewTemplates: [
      { text: "Clean vehicle, smooth ride.", stars: 5 },
      { text: "Always on time and reliable.", stars: 5 },
      { text: "Good experience overall.", stars: 4 },
    ],
  },
  "Home Services": {
    metrics: [
      { label: "Jobs Completed", min: 5, max: 500, format: (v) => v.toLocaleString() },
      { label: "Rating", min: 38, max: 50, format: (v) => `${(v / 10).toFixed(1)} / 5.0` },
      { label: "Response Time", min: 5, max: 120, format: (v) => v < 60 ? `${v} min` : `${Math.round(v / 60)} hr` },
      { label: "Repeat Clients", min: 10, max: 85, format: (v) => `${v}%` },
    ],
    reviewTemplates: [
      { text: "Excellent work, very thorough!", stars: 5 },
      { text: "Professional and on time.", stars: 5 },
      { text: "Good job, would hire again.", stars: 4 },
      { text: "Fixed everything perfectly.", stars: 5 },
    ],
  },
  "Entertainment": {
    metrics: [
      { label: "Hours", min: 50, max: 10000, format: (v) => `${v.toLocaleString()} hrs` },
      { label: "Library", min: 5, max: 500, format: (v) => `${v} titles` },
      { label: "Achievements", min: 10, max: 2000, format: (v) => v.toLocaleString() },
      { label: "Account Level", min: 1, max: 200, format: (v) => `Lv. ${v}` },
    ],
    reviewTemplates: [
      { text: "Great community member, always helpful.", stars: 5 },
      { text: "Active user, positive contributions.", stars: 5 },
      { text: "Fun to play with, good sportsmanship.", stars: 4 },
      { text: "Long-time member, trusted account.", stars: 5 },
    ],
  },
  "Health & Wellness": {
    metrics: [
      { label: "Visits", min: 5, max: 500, format: (v) => v.toLocaleString() },
      { label: "Classes Attended", min: 5, max: 300, format: (v) => v.toLocaleString() },
      { label: "Streak", min: 1, max: 365, format: (v) => `${v} days` },
      { label: "Membership", min: 1, max: 4, format: (v) => ["Basic", "Plus", "Premium", "Elite"][v - 1] },
    ],
    reviewTemplates: [
      { text: "Dedicated and consistent. Great member!", stars: 5 },
      { text: "Always shows up, positive attitude.", stars: 5 },
      { text: "Good gym buddy, motivating presence.", stars: 4 },
    ],
  },
  "Education": {
    metrics: [
      { label: "Courses Completed", min: 1, max: 50, format: (v) => v.toLocaleString() },
      { label: "Certificates", min: 0, max: 20, format: (v) => v.toLocaleString() },
      { label: "Hours Learned", min: 10, max: 2000, format: (v) => `${v.toLocaleString()} hrs` },
      { label: "Completion Rate", min: 60, max: 100, format: (v) => `${v}%` },
    ],
    reviewTemplates: [
      { text: "Engaged learner, thoughtful questions.", stars: 5 },
      { text: "Completed all assignments on time.", stars: 5 },
      { text: "Great study partner, helps others.", stars: 4 },
    ],
  },
};

const reviewerNames = [
  "Alex M.", "Jamie R.", "Sam K.", "Jordan T.", "Casey L.",
  "Morgan P.", "Riley S.", "Quinn D.", "Avery H.", "Drew F.",
  "Taylor N.", "Blake W.", "Hayden C.", "Reese B.", "Emerson G.",
];

// ─── Seeded pseudo-random ───
function makeRng(platformId: string) {
  let seed = 0;
  for (let i = 0; i < platformId.length; i++) {
    seed = ((seed << 5) - seed + platformId.charCodeAt(i)) | 0;
  }
  return (min: number, max: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return min + (seed % (max - min + 1));
  };
}

/**
 * Generate a mock PlatformProfile with CLUSTER-APPROPRIATE metrics.
 */
export function generateMockProfile(
  platformId: string,
  platformName: string,
  category: string,
  color: string,
  icon: string,
  cluster?: string,
): PlatformProfile {
  const rand = makeRng(platformId);

  // Determine cluster — try to find from taxonomy, fall back to provided or "Work & Gig Economy"
  const effectiveCluster = cluster ?? "Work & Gig Economy";
  const clusterDef = clusterMetrics[effectiveCluster] ?? clusterMetrics["Work & Gig Economy"];

  // Generate metrics
  const metrics: PlatformMetric[] = clusterDef.metrics.map((def) => {
    const value = rand(def.min, def.max);
    return { label: def.label, value: def.format(value), numericValue: value };
  });

  // Score: 0-100 based on the first metric (usually the primary quality indicator)
  const primaryMetric = metrics[0];
  const primaryDef = clusterDef.metrics[0];
  const score = Math.round(
    ((primaryMetric.numericValue - primaryDef.min) / (primaryDef.max - primaryDef.min)) * 40 + 60
  ); // 60-100 range

  const yearStart = rand(2019, 2025);
  const monthStart = rand(1, 12);
  const memberSince = `${yearStart}-${String(monthStart).padStart(2, "0")}-01`;

  const reviewCount = rand(2, 4);
  const reviews: PlatformReview[] = [];
  for (let i = 0; i < reviewCount; i++) {
    const template = clusterDef.reviewTemplates[rand(0, clusterDef.reviewTemplates.length - 1)];
    const reviewer = reviewerNames[rand(0, reviewerNames.length - 1)];
    const month = rand(1, 3);
    const day = rand(1, 28);
    reviews.push({
      text: template.text,
      stars: template.stars,
      date: `2026-0${month}-${String(day).padStart(2, "0")}`,
      reviewer,
    });
  }

  return {
    platformId,
    platformName,
    category,
    cluster: effectiveCluster,
    score,
    metrics,
    memberSince,
    reviews,
    color,
    icon,
  };
}

// ─── Pre-built profiles for demo personas (Work & Gig Economy) ───
export const platformInfo: Record<string, { name: string; category: string; color: string; icon: string }> = {
  instacart: { name: "Instacart", category: "Delivery", color: "bg-green-600", icon: "IC" },
  uber: { name: "Uber", category: "Rideshare", color: "bg-gray-800", icon: "UB" },
  doordash: { name: "DoorDash", category: "Delivery", color: "bg-red-600", icon: "DD" },
  lyft: { name: "Lyft", category: "Rideshare", color: "bg-pink-600", icon: "LF" },
  taskrabbit: { name: "TaskRabbit", category: "Services", color: "bg-emerald-600", icon: "TR" },
  grubhub: { name: "Grubhub", category: "Delivery", color: "bg-orange-600", icon: "GH" },
};

function gigProfile(
  id: string, name: string, cat: string, color: string, icon: string,
  rating: number, jobs: number, onTime: number, since: string,
  reviews: PlatformReview[]
): PlatformProfile {
  return {
    platformId: id, platformName: name, category: cat, cluster: "Work & Gig Economy",
    score: Math.round((rating / 5) * 100),
    metrics: [
      { label: "Rating", value: `${rating.toFixed(1)} / 5.0`, numericValue: rating * 10 },
      { label: "Jobs Completed", value: jobs.toLocaleString(), numericValue: jobs },
      { label: "On-Time Rate", value: `${onTime}%`, numericValue: onTime },
    ],
    memberSince: since, reviews, color, icon,
  };
}

export const sandboxPlatformProfiles: Record<string, PlatformProfile[]> = {
  "123-45-6789": [
    gigProfile("instacart", "Instacart", "Delivery", "bg-green-600", "IC", 4.8, 1247, 97, "2023-03-15", [
      { text: "Super fast delivery, items were perfectly picked!", stars: 5, date: "2026-02-28", reviewer: "Sarah M." },
      { text: "Always communicates about replacements. Great shopper.", stars: 5, date: "2026-02-15", reviewer: "James K." },
      { text: "Delivered on time even in the rain. Thank you!", stars: 5, date: "2026-01-30", reviewer: "Maria G." },
    ]),
    gigProfile("doordash", "DoorDash", "Delivery", "bg-red-600", "DD", 4.6, 892, 94, "2023-06-01", [
      { text: "Food arrived hot and on time!", stars: 5, date: "2026-03-01", reviewer: "Lisa W." },
      { text: "Quick and professional delivery.", stars: 5, date: "2026-02-20", reviewer: "Derek P." },
    ]),
  ],
  "234-56-7890": [
    gigProfile("uber", "Uber", "Rideshare", "bg-gray-800", "UB", 4.9, 2103, 96, "2022-01-10", [
      { text: "Smooth ride, great conversation!", stars: 5, date: "2026-03-05", reviewer: "Chris L." },
      { text: "Very clean car and safe driver.", stars: 5, date: "2026-02-22", reviewer: "Nina B." },
    ]),
    gigProfile("lyft", "Lyft", "Rideshare", "bg-pink-600", "LF", 4.7, 634, 95, "2022-08-20", [
      { text: "Great driver, would ride again!", stars: 5, date: "2026-02-28", reviewer: "Kate M." },
    ]),
  ],
  "345-67-8901": [
    gigProfile("taskrabbit", "TaskRabbit", "Services", "bg-emerald-600", "TR", 4.9, 312, 98, "2023-01-05", [
      { text: "Assembled my IKEA furniture in record time!", stars: 5, date: "2026-03-02", reviewer: "Dan H." },
      { text: "Thorough, professional, and friendly.", stars: 5, date: "2026-02-18", reviewer: "Rachel T." },
    ]),
  ],
  "456-78-9012": [
    gigProfile("uber", "Uber", "Rideshare", "bg-gray-800", "UB", 4.6, 567, 93, "2023-09-01", [
      { text: "Reliable driver, clean vehicle.", stars: 5, date: "2026-03-01", reviewer: "Emma T." },
    ]),
    gigProfile("doordash", "DoorDash", "Delivery", "bg-red-600", "DD", 4.4, 423, 91, "2024-01-15", [
      { text: "Fast delivery, food was still warm.", stars: 5, date: "2026-02-27", reviewer: "Sandy K." },
    ]),
  ],
  "567-89-0123": [
    gigProfile("instacart", "Instacart", "Delivery", "bg-green-600", "IC", 4.7, 78, 95, "2025-06-01", [
      { text: "Very careful with my groceries. Thank you!", stars: 5, date: "2026-02-28", reviewer: "Linda M." },
    ]),
  ],
  "678-90-1234": [
    gigProfile("uber", "Uber", "Rideshare", "bg-gray-800", "UB", 4.8, 3456, 97, "2020-05-01", [
      { text: "Best Uber driver I've ever had!", stars: 5, date: "2026-03-08", reviewer: "Alex G." },
      { text: "Professional, punctual, and friendly.", stars: 5, date: "2026-02-28", reviewer: "Jessica H." },
    ]),
    gigProfile("lyft", "Lyft", "Rideshare", "bg-pink-600", "LF", 4.9, 1892, 98, "2020-08-15", [
      { text: "Frank is the GOAT. Always request him!", stars: 5, date: "2026-03-05", reviewer: "Sam W." },
    ]),
  ],
  "789-01-2345": [
    gigProfile("grubhub", "Grubhub", "Delivery", "bg-orange-600", "GH", 4.5, 234, 93, "2024-04-01", [
      { text: "Always delivers with a smile!", stars: 5, date: "2026-03-02", reviewer: "Peter N." },
    ]),
  ],
  "890-12-3456": [
    gigProfile("uber", "Uber", "Rideshare", "bg-gray-800", "UB", 4.9, 5678, 98, "2019-02-01", [
      { text: "Henry is a legend. 5 stars every time.", stars: 5, date: "2026-03-10", reviewer: "Sophia R." },
      { text: "Safest driver in the city, hands down.", stars: 5, date: "2026-03-05", reviewer: "Ryan M." },
    ]),
    gigProfile("doordash", "DoorDash", "Delivery", "bg-red-600", "DD", 4.7, 2341, 96, "2019-06-15", [
      { text: "Lightning fast delivery. Impressive!", stars: 5, date: "2026-03-08", reviewer: "Nancy W." },
    ]),
    gigProfile("lyft", "Lyft", "Rideshare", "bg-pink-600", "LF", 4.8, 3210, 97, "2019-04-01", [
      { text: "Great ride, great guy!", stars: 5, date: "2026-03-06", reviewer: "Wendy S." },
    ]),
    gigProfile("grubhub", "Grubhub", "Delivery", "bg-orange-600", "GH", 4.6, 1567, 95, "2020-01-10", [
      { text: "Consistent and reliable. My go-to driver.", stars: 5, date: "2026-03-01", reviewer: "Justin F." },
    ]),
    gigProfile("taskrabbit", "TaskRabbit", "Services", "bg-emerald-600", "TR", 4.7, 445, 96, "2020-09-01", [
      { text: "Henry can fix anything. Amazing handyman!", stars: 5, date: "2026-02-20", reviewer: "Patricia L." },
    ]),
  ],
};

/**
 * Calculate composite reputation score (0-100) from a person's platforms
 */
export function calculateCompositeScore(profiles: PlatformProfile[]): number {
  if (profiles.length === 0) return 0;
  const avg = profiles.reduce((sum, p) => sum + p.score, 0) / profiles.length;
  return Math.round(avg * 10) / 10;
}
