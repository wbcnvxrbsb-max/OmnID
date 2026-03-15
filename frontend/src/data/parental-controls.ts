import { pushActivity } from "../activity";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ContentLevel = "restricted" | "moderate" | "open";

export interface PlatformPermission {
  platformId: string;
  allowed: boolean;
  contentLevel: ContentLevel;
  spotifyExplicit?: boolean;
  cryptoEnabled?: boolean;
  cardEnabled?: boolean;
}

export interface ApprovalRequest {
  id: string;
  childId: string;
  platformId: string;
  platformName: string;
  requestedAt: number;
  status: "pending" | "approved" | "denied";
  resolvedAt?: number;
  parentContentLevel?: ContentLevel;
}

export interface ChildAccount {
  id: string;
  name: string;
  birthdate: string; // YYYY-MM-DD
  registeredAt: number;
  platformPermissions: PlatformPermission[];
  picture?: string;
}

export interface ParentData {
  children: ChildAccount[];
  approvalRequests: ApprovalRequest[];
}

/* ------------------------------------------------------------------ */
/*  Platform age rules                                                 */
/* ------------------------------------------------------------------ */

export interface PlatformAgeRule {
  platformId: string;
  minAge: number;
  childAccountAvailable: boolean; // Platform natively supports child/family accounts
  omnidPartner: boolean; // Platform has partnered with OmnID to accept children via parental consent
  label: string;
}

// parentOverrideAllowed is REMOVED — parents cannot override a platform's own age requirements.
// Instead, platforms that partner with OmnID can accept children with verified parental consent.
// Platforms that haven't partnered enforce their own age gate — OmnID cannot bypass it.

export const PLATFORM_AGE_RULES: PlatformAgeRule[] = [
  // Platforms with native child/family support OR OmnID partnership
  { platformId: "spotify",   minAge: 13, childAccountAvailable: true,  omnidPartner: false, label: "13+ (has family/kids accounts)" },
  { platformId: "doordash",  minAge: 18, childAccountAvailable: true,  omnidPartner: false, label: "18+ (dasher) / any (customer)" },
  { platformId: "instacart", minAge: 18, childAccountAvailable: true,  omnidPartner: false, label: "18+ (shopper) / any (customer)" },

  // Platforms that enforce age — OmnID cannot override
  { platformId: "facebook",  minAge: 13, childAccountAvailable: false, omnidPartner: false, label: "13+ (platform-enforced)" },
  { platformId: "linkedin",  minAge: 16, childAccountAvailable: false, omnidPartner: false, label: "16+ (platform-enforced)" },
  { platformId: "uber",      minAge: 18, childAccountAvailable: false, omnidPartner: false, label: "18+ (legal requirement)" },
  { platformId: "airbnb",    minAge: 18, childAccountAvailable: false, omnidPartner: false, label: "18+ (legal requirement)" },
  { platformId: "coinbase",  minAge: 18, childAccountAvailable: false, omnidPartner: false, label: "18+ (regulatory requirement)" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "omnid-parent-data";

const DEFAULT_PARENT_DATA: ParentData = {
  children: [],
  approvalRequests: [],
};

export function getParentData(): ParentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PARENT_DATA;
    return JSON.parse(raw) as ParentData;
  } catch {
    return DEFAULT_PARENT_DATA;
  }
}

export function saveParentData(data: ParentData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getChildAge(child: ChildAccount): number {
  return calculateAge(child.birthdate);
}

export function getPlatformAgeRule(platformId: string): PlatformAgeRule | undefined {
  return PLATFORM_AGE_RULES.find((r) => r.platformId === platformId);
}

/**
 * Determine if a child can use a platform:
 * - "allowed" — child meets the minimum age
 * - "needs_consent" — child meets age for a platform with child accounts,
 *    parent needs to consent to data sharing (NOT override age)
 * - "blocked" — child is under the platform's minimum age. OmnID cannot
 *    override a platform's own age requirements.
 * - "parent_blocked" — parent explicitly blocked this platform
 */
export function canChildUsePlatform(
  child: ChildAccount,
  platformId: string
): "allowed" | "needs_consent" | "blocked" | "parent_blocked" {
  const rule = getPlatformAgeRule(platformId);
  if (!rule) return "allowed";

  const age = getChildAge(child);

  // Check if parent already consented to data sharing for this platform
  const perm = child.platformPermissions.find((p) => p.platformId === platformId);
  if (perm?.allowed) return "allowed";

  // Parent explicitly blocked this platform
  if (perm && !perm.allowed) return "parent_blocked";

  // Child meets the platform's age requirement
  if (age >= rule.minAge) return "allowed";

  // Platform has native child/family accounts OR is an OmnID partner —
  // parent can consent to data sharing (platform handles its own child experience)
  if (rule.childAccountAvailable || rule.omnidPartner) return "needs_consent";

  // Platform enforces its own age gate — OmnID cannot override it
  return "blocked";
}

/**
 * Check for children who turned 18 and eject them.
 * Returns updated ParentData with ejected children removed.
 */
export function checkAutoEjection(data: ParentData): ParentData {
  const remaining: ChildAccount[] = [];
  let changed = false;

  for (const child of data.children) {
    const age = getChildAge(child);
    if (age >= 18) {
      changed = true;
      pushActivity(
        `${child.name} turned 18 — graduated to adult account`,
        "18",
        "bg-omn-success"
      );
    } else {
      remaining.push(child);
    }
  }

  if (!changed) return data;

  // Remove approval requests for ejected children
  const remainingIds = new Set(remaining.map((c) => c.id));
  const filteredRequests = data.approvalRequests.filter((r) =>
    remainingIds.has(r.childId)
  );

  const updated: ParentData = {
    children: remaining,
    approvalRequests: filteredRequests,
  };
  saveParentData(updated);
  return updated;
}

/**
 * Add a child to the parent's account.
 */
export function addChild(child: ChildAccount): void {
  const data = getParentData();
  data.children.push(child);
  saveParentData(data);
  pushActivity(
    `Registered child account for ${child.name} (age ${getChildAge(child)})`,
    "CH",
    "bg-omn-primary"
  );
}

/**
 * Remove a child from the parent's account.
 */
export function removeChild(childId: string): void {
  const data = getParentData();
  const child = data.children.find((c) => c.id === childId);
  data.children = data.children.filter((c) => c.id !== childId);
  data.approvalRequests = data.approvalRequests.filter(
    (r) => r.childId !== childId
  );
  saveParentData(data);
  if (child) {
    pushActivity(`Removed child account: ${child.name}`, "CH", "bg-omn-danger");
  }
}

/**
 * Update platform permission for a child.
 */
export function updateChildPermission(
  childId: string,
  permission: PlatformPermission
): void {
  const data = getParentData();
  const child = data.children.find((c) => c.id === childId);
  if (!child) return;

  const idx = child.platformPermissions.findIndex(
    (p) => p.platformId === permission.platformId
  );
  if (idx >= 0) {
    child.platformPermissions[idx] = permission;
  } else {
    child.platformPermissions.push(permission);
  }
  saveParentData(data);
}

/**
 * Create an approval request from a child for a platform.
 */
export function createApprovalRequest(
  childId: string,
  platformId: string,
  platformName: string
): ApprovalRequest {
  const data = getParentData();
  const request: ApprovalRequest = {
    id: `req-${Date.now()}`,
    childId,
    platformId,
    platformName,
    requestedAt: Date.now(),
    status: "pending",
  };
  data.approvalRequests.push(request);
  saveParentData(data);
  return request;
}

/**
 * Resolve an approval request.
 */
export function resolveApprovalRequest(
  requestId: string,
  approved: boolean,
  contentLevel?: ContentLevel
): void {
  const data = getParentData();
  const request = data.approvalRequests.find((r) => r.id === requestId);
  if (!request) return;

  request.status = approved ? "approved" : "denied";
  request.resolvedAt = Date.now();
  if (contentLevel) request.parentContentLevel = contentLevel;

  if (approved) {
    const child = data.children.find((c) => c.id === request.childId);
    if (child) {
      const perm: PlatformPermission = {
        platformId: request.platformId,
        allowed: true,
        contentLevel: contentLevel ?? "restricted",
      };
      const idx = child.platformPermissions.findIndex(
        (p) => p.platformId === request.platformId
      );
      if (idx >= 0) {
        child.platformPermissions[idx] = perm;
      } else {
        child.platformPermissions.push(perm);
      }
    }
  }

  saveParentData(data);
}
