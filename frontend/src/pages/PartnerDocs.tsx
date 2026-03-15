import { NavLink } from "react-router-dom";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requestBody: string | null;
  responseBody: string;
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/partner/verify-age",
    description:
      "Verify a child's age using their email. Returns the child's verified age and whether they meet your platform's minimum age requirement.",
    requestBody: JSON.stringify(
      {
        childEmail: "alice@example.com",
        platformId: "your-platform",
        apiKey: "your-api-key",
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        verified: true,
        age: 12,
        meetsMinAge: false,
        minAge: 13,
        parentConsent: null,
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/partner/request-consent",
    description:
      "Request parental consent for a child who does not meet the platform's minimum age. The parent will receive a notification in their OmnID dashboard to review and approve.",
    requestBody: JSON.stringify(
      {
        childEmail: "alice@example.com",
        platformId: "your-platform",
        platformName: "Your Platform Name",
        apiKey: "your-api-key",
        requestedPermissions: ["account_creation", "content_access"],
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        requestId: "cr_abc123def456",
        status: "pending",
        parentNotified: true,
        expiresAt: "2025-02-01T00:00:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/partner/consent-status/:requestId",
    description:
      "Poll the status of a parental consent request. Returns the current status and, once approved, the content controls set by the parent.",
    requestBody: null,
    responseBody: JSON.stringify(
      {
        requestId: "cr_abc123def456",
        status: "approved",
        contentLevel: "moderate",
        approvedPermissions: ["account_creation", "content_access"],
        approvedAt: "2025-01-15T14:30:00Z",
        parentVerified: true,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/partner/child-controls/:email",
    description:
      "Retrieve the content controls a parent has set for their child on your platform. Use this to enforce parental preferences in your UI.",
    requestBody: null,
    responseBody: JSON.stringify(
      {
        childEmail: "alice@example.com",
        contentLevel: "moderate",
        restrictions: {
          chat: false,
          purchases: false,
          socialFeatures: true,
          adPersonalization: false,
        },
        dailyTimeLimit: 120,
        allowedHours: { start: "08:00", end: "20:00" },
        parentEmail: "parent@example.com",
        lastUpdated: "2025-01-15T14:30:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/partner/activity-report",
    description:
      "Send child activity data back to OmnID so parents can see what their children are doing on your platform. This builds trust with parents and improves retention.",
    requestBody: JSON.stringify(
      {
        childEmail: "alice@example.com",
        platformId: "your-platform",
        apiKey: "your-api-key",
        activities: [
          {
            type: "content_view",
            title: "Math Practice Level 5",
            duration: 1800,
            timestamp: "2025-01-15T15:00:00Z",
          },
          {
            type: "purchase_attempt",
            item: "Premium Sticker Pack",
            amount: 2.99,
            blocked: true,
            timestamp: "2025-01-15T15:30:00Z",
          },
        ],
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        received: true,
        activitiesLogged: 2,
        parentNotified: false,
      },
      null,
      2
    ),
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/20 text-green-400 border-green-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${
        colors[method] ?? "bg-omn-surface text-omn-text border-omn-border"
      }`}
    >
      {method}
    </span>
  );
}

export default function PartnerDocs() {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <NavLink
            to="/partners"
            className="text-sm text-omn-primary-light hover:text-omn-accent transition-colors mb-4 inline-block"
          >
            &larr; Back to Partners
          </NavLink>
          <h1 className="text-3xl font-bold text-omn-heading mb-2">
            Partner API Documentation
          </h1>
          <p className="text-omn-text">
            Everything you need to integrate OmnID child identity verification
            into your platform.
          </p>
        </div>

        {/* Auth Note */}
        <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-omn-heading mb-1">
            Authentication
          </h3>
          <p className="text-xs text-omn-text">
            All endpoints require an API key. Include your key in the request
            body as <code className="text-omn-accent font-mono">apiKey</code>{" "}
            for POST requests, or as a query parameter{" "}
            <code className="text-omn-accent font-mono">?apiKey=your-key</code>{" "}
            for GET requests. To obtain an API key, email{" "}
            <a
              href="mailto:partners@omnid.app"
              className="text-omn-primary-light hover:text-omn-accent transition-colors"
            >
              partners@omnid.app
            </a>
            .
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-omn-heading mb-2">
            Base URL
          </h3>
          <div className="bg-[#0d1117] rounded-lg p-3">
            <code className="text-sm text-green-400 font-mono">
              https://api.omnid.app
            </code>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="bg-omn-surface border border-omn-border rounded-xl overflow-hidden"
            >
              {/* Endpoint Header */}
              <div className="p-4 border-b border-omn-border">
                <div className="flex items-center gap-3 mb-2">
                  <MethodBadge method={ep.method} />
                  <code className="text-sm font-mono text-omn-heading">
                    {ep.path}
                  </code>
                </div>
                <p className="text-sm text-omn-text">{ep.description}</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Request Body */}
                {ep.requestBody && (
                  <div>
                    <h4 className="text-xs font-semibold text-omn-text uppercase tracking-wider mb-2">
                      Request Body
                    </h4>
                    <div className="bg-[#0d1117] rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-green-400 font-mono whitespace-pre">
                        {ep.requestBody}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response */}
                <div>
                  <h4 className="text-xs font-semibold text-omn-text uppercase tracking-wider mb-2">
                    Response
                  </h4>
                  <div className="bg-[#0d1117] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre">
                      {ep.responseBody}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help */}
        <div className="mt-12 text-center mb-8">
          <p className="text-omn-text mb-3">
            Need help integrating? We are here for you.
          </p>
          <a
            href="mailto:partners@omnid.app"
            className="inline-block px-6 py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-omn-primary/20"
          >
            Contact Partner Support
          </a>
        </div>
      </div>
    </div>
  );
}
