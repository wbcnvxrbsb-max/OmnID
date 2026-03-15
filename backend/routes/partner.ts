import { Router, Request, Response, NextFunction } from "express";

const router = Router();

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ContentLevel = "restricted" | "moderate" | "open";
type ConsentStatus = "pending" | "approved" | "denied";

interface VerifyAgeRequest {
  childEmail: string;
  platformId: string;
  apiKey: string;
}

interface VerifyAgeResponse {
  verified: boolean;
  age: number;
  meetsMinAge: boolean;
  minAge: number;
  parentConsent: string | null;
}

interface RequestConsentBody {
  childEmail: string;
  parentEmail: string;
  platformId: string;
  platformName: string;
  requestedPermissions: string[];
  apiKey: string;
}

interface RequestConsentResponse {
  requestId: string;
  status: ConsentStatus;
  message: string;
}

interface ConsentStatusResponse {
  requestId: string;
  status: ConsentStatus;
  contentLevel?: ContentLevel;
  approvedAt?: string;
}

interface ChildControlsResponse {
  contentLevel: ContentLevel;
  spotifyExplicit?: boolean;
  cryptoEnabled?: boolean;
  customRules: string[];
}

interface ReportActivityBody {
  childEmail: string;
  platformId: string;
  activityType: string;
  description: string;
  apiKey: string;
}

interface ConsentRecord {
  requestId: string;
  childEmail: string;
  parentEmail: string;
  platformId: string;
  platformName: string;
  requestedPermissions: string[];
  status: ConsentStatus;
  contentLevel?: ContentLevel;
  createdAt: string;
  approvedAt?: string;
}

/* ------------------------------------------------------------------ */
/*  Sandbox data (mirrors frontend/src/data/sandbox-ssn.ts)            */
/* ------------------------------------------------------------------ */

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

interface SandboxChild {
  email: string;
  name: string;
  birthdate: string;
  parentEmail: string;
}

const SANDBOX_CHILDREN: SandboxChild[] = [
  { email: "alice@demo.omnid.com", name: "Alice Johnson", birthdate: "2013-06-15", parentEmail: "parent.johnson@demo.omnid.com" },
  { email: "bob@demo.omnid.com", name: "Bob Chen", birthdate: "2009-03-22", parentEmail: "parent.chen@demo.omnid.com" },
  { email: "carol@demo.omnid.com", name: "Carol Martinez", birthdate: "2010-11-08", parentEmail: "parent.martinez@demo.omnid.com" },
  { email: "david@demo.omnid.com", name: "David Kim", birthdate: "2005-01-30", parentEmail: "parent.kim@demo.omnid.com" },
  { email: "emma@demo.omnid.com", name: "Emma Williams", birthdate: "2014-09-12", parentEmail: "parent.williams@demo.omnid.com" },
  { email: "grace@demo.omnid.com", name: "Grace Lee", birthdate: "2012-12-25", parentEmail: "parent.lee@demo.omnid.com" },
];

/** Platform minimum ages — matches frontend PLATFORM_AGE_RULES */
const PLATFORM_MIN_AGES: Record<string, number> = {
  spotify: 13,
  doordash: 18,
  instacart: 18,
  facebook: 13,
  linkedin: 16,
  uber: 18,
  airbnb: 18,
  coinbase: 18,
};

/* ------------------------------------------------------------------ */
/*  In-memory stores (would be a database in production)               */
/* ------------------------------------------------------------------ */

const consentRequests = new Map<string, ConsentRecord>();
const activityLog: Array<{
  childEmail: string;
  platformId: string;
  activityType: string;
  description: string;
  timestamp: string;
}> = [];

/* ------------------------------------------------------------------ */
/*  Middleware: authenticatePartner                                     */
/* ------------------------------------------------------------------ */

const DEMO_KEY = "omnid-demo-key-2026";

function getValidApiKeys(): string[] {
  const envKeys = process.env.PARTNER_API_KEYS;
  const keys = envKeys ? envKeys.split(",").map((k) => k.trim()).filter(Boolean) : [];
  keys.push(DEMO_KEY);
  return keys;
}

function authenticatePartner(req: Request, res: Response, next: NextFunction): void {
  const apiKey =
    (req.body as Record<string, unknown>)?.apiKey as string | undefined ??
    (req.query.apiKey as string | undefined);

  if (!apiKey) {
    res.status(401).json({ error: "Missing API key" });
    return;
  }

  const validKeys = getValidApiKeys();
  if (!validKeys.includes(apiKey)) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  next();
}

/* ------------------------------------------------------------------ */
/*  Logging helper                                                     */
/* ------------------------------------------------------------------ */

function logPartnerCall(endpoint: string, platformId: string | undefined): void {
  const ts = new Date().toISOString();
  console.log(`[partner-api] ${ts} | ${endpoint} | platformId=${platformId ?? "unknown"}`);
}

/* ------------------------------------------------------------------ */
/*  1. POST /api/partner/verify-age                                    */
/* ------------------------------------------------------------------ */

router.post("/api/partner/verify-age", authenticatePartner, (req: Request, res: Response) => {
  const { childEmail, platformId } = req.body as VerifyAgeRequest;
  logPartnerCall("POST /api/partner/verify-age", platformId);

  if (!childEmail || !platformId) {
    return res.status(400).json({ error: "Missing childEmail or platformId" });
  }

  // Look up child in sandbox database
  const child = SANDBOX_CHILDREN.find(
    (c) => c.email.toLowerCase() === childEmail.toLowerCase()
  );

  if (!child) {
    return res.status(404).json({ error: "Child not found in verified identity database" });
  }

  const age = calculateAge(child.birthdate);
  const minAge = PLATFORM_MIN_AGES[platformId] ?? 13;
  const meetsMinAge = age >= minAge;

  // Check if there is an approved consent request for this child + platform
  let parentConsent: string | null = null;
  for (const [, record] of consentRequests) {
    if (
      record.childEmail.toLowerCase() === childEmail.toLowerCase() &&
      record.platformId === platformId &&
      record.status === "approved"
    ) {
      parentConsent = record.requestId;
      break;
    }
  }

  const response: VerifyAgeResponse = {
    verified: true,
    age,
    meetsMinAge,
    minAge,
    parentConsent,
  };

  return res.json(response);
});

/* ------------------------------------------------------------------ */
/*  2. POST /api/partner/request-consent                               */
/* ------------------------------------------------------------------ */

router.post("/api/partner/request-consent", authenticatePartner, (req: Request, res: Response) => {
  const {
    childEmail,
    parentEmail,
    platformId,
    platformName,
    requestedPermissions,
  } = req.body as RequestConsentBody;
  logPartnerCall("POST /api/partner/request-consent", platformId);

  if (!childEmail || !parentEmail || !platformId || !platformName) {
    return res.status(400).json({
      error: "Missing required fields: childEmail, parentEmail, platformId, platformName",
    });
  }

  if (!requestedPermissions || !Array.isArray(requestedPermissions) || requestedPermissions.length === 0) {
    return res.status(400).json({ error: "requestedPermissions must be a non-empty array" });
  }

  const requestId = `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const record: ConsentRecord = {
    requestId,
    childEmail,
    parentEmail,
    platformId,
    platformName,
    requestedPermissions,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  consentRequests.set(requestId, record);

  const response: RequestConsentResponse = {
    requestId,
    status: "pending",
    message: "Consent request sent to parent",
  };

  return res.json(response);
});

/* ------------------------------------------------------------------ */
/*  3. GET /api/partner/consent-status/:requestId                      */
/* ------------------------------------------------------------------ */

router.get("/api/partner/consent-status/:requestId", authenticatePartner, (req: Request<{ requestId: string }>, res: Response) => {
  const { requestId } = req.params;
  logPartnerCall("GET /api/partner/consent-status", undefined);

  const record = consentRequests.get(requestId);
  if (!record) {
    return res.status(404).json({ error: "Consent request not found" });
  }

  const response: ConsentStatusResponse = {
    requestId: record.requestId,
    status: record.status,
  };

  if (record.contentLevel) {
    response.contentLevel = record.contentLevel;
  }

  if (record.approvedAt) {
    response.approvedAt = record.approvedAt;
  }

  return res.json(response);
});

/* ------------------------------------------------------------------ */
/*  4. GET /api/partner/child-controls/:childEmail                     */
/* ------------------------------------------------------------------ */

router.get("/api/partner/child-controls/:childEmail", authenticatePartner, (req: Request<{ childEmail: string }>, res: Response) => {
  const { childEmail } = req.params;
  const platformId = req.query.platformId as string | undefined;
  logPartnerCall("GET /api/partner/child-controls", platformId);

  if (!platformId) {
    return res.status(400).json({ error: "Missing platformId query parameter" });
  }

  // In production this would come from the parent's stored settings.
  // For sandbox, return mock controls based on the platform.
  const child = SANDBOX_CHILDREN.find(
    (c) => c.email.toLowerCase() === childEmail.toLowerCase()
  );

  if (!child) {
    return res.status(404).json({ error: "Child not found in verified identity database" });
  }

  const age = calculateAge(child.birthdate);

  // Default controls based on age
  let contentLevel: ContentLevel = "restricted";
  if (age >= 16) contentLevel = "moderate";
  if (age >= 18) contentLevel = "open";

  const response: ChildControlsResponse = {
    contentLevel,
    customRules: [],
  };

  // Platform-specific controls
  if (platformId === "spotify") {
    response.spotifyExplicit = age >= 16;
  }

  if (platformId === "coinbase") {
    response.cryptoEnabled = age >= 18;
  }

  // Add age-based custom rules
  if (age < 13) {
    response.customRules.push("No direct messaging with strangers");
    response.customRules.push("No in-app purchases without parent approval");
  } else if (age < 16) {
    response.customRules.push("No in-app purchases over $10 without parent approval");
  }

  return res.json(response);
});

/* ------------------------------------------------------------------ */
/*  5. POST /api/partner/report-activity                               */
/* ------------------------------------------------------------------ */

router.post("/api/partner/report-activity", authenticatePartner, (req: Request, res: Response) => {
  const { childEmail, platformId, activityType, description } = req.body as ReportActivityBody;
  logPartnerCall("POST /api/partner/report-activity", platformId);

  if (!childEmail || !platformId || !activityType || !description) {
    return res.status(400).json({
      error: "Missing required fields: childEmail, platformId, activityType, description",
    });
  }

  activityLog.push({
    childEmail,
    platformId,
    activityType,
    description,
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true });
});

/* ------------------------------------------------------------------ */
/*  Internal: POST /api/partner/resolve-consent (for parent dashboard) */
/* ------------------------------------------------------------------ */

router.post("/api/partner/resolve-consent", authenticatePartner, (req: Request, res: Response) => {
  const { requestId, approved, contentLevel } = req.body as {
    requestId: string;
    approved: boolean;
    contentLevel?: ContentLevel;
    apiKey: string;
  };
  logPartnerCall("POST /api/partner/resolve-consent", undefined);

  if (!requestId || typeof approved !== "boolean") {
    return res.status(400).json({ error: "Missing requestId or approved (boolean)" });
  }

  const record = consentRequests.get(requestId);
  if (!record) {
    return res.status(404).json({ error: "Consent request not found" });
  }

  if (record.status !== "pending") {
    return res.status(409).json({ error: "Consent request already resolved" });
  }

  record.status = approved ? "approved" : "denied";
  if (approved) {
    record.approvedAt = new Date().toISOString();
    record.contentLevel = contentLevel ?? "restricted";
  }

  consentRequests.set(requestId, record);

  return res.json({
    requestId: record.requestId,
    status: record.status,
    contentLevel: record.contentLevel,
    approvedAt: record.approvedAt,
  });
});

export default router;
