import { useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE } from "../api/config";

const problems = [
  "COPPA compliance is complex and expensive to implement correctly",
  "Building age verification in-house takes months of engineering time",
  "Parental consent flows are notoriously hard to get right",
  "One mistake means FTC fines up to $50,000 per violation",
];

const features = [
  {
    title: "Verified Age",
    description:
      "SSN-backed age verification. Know the child's exact age, not just an \"I'm over 13\" checkbox. Hash-only, zero PII exposure.",
  },
  {
    title: "Parental Consent",
    description:
      "Verified parent identity (also SSN-backed). Cryptographic proof that the legal guardian consented. Holds up to FTC scrutiny.",
  },
  {
    title: "Content Controls",
    description:
      "Parents set per-platform content levels (restricted/moderate/open). Your platform reads these via API and enforces them. Parents stay in control.",
  },
  {
    title: "Activity Reporting",
    description:
      "Send child activity data back to OmnID. Parents see what their kids do across all platforms in one dashboard. Builds trust.",
  },
];

const steps = [
  {
    endpoint: "POST /api/partner/verify-age",
    description: "Platform calls verify-age with child's email",
  },
  {
    endpoint: null,
    description:
      "OmnID returns verified age and whether child meets platform minimum",
  },
  {
    endpoint: "POST /api/partner/request-consent",
    description: "If under age, platform calls request-consent",
  },
  {
    endpoint: null,
    description:
      "Parent receives notification in OmnID, sets content controls, approves",
  },
  {
    endpoint: "GET /api/partner/consent-status/:requestId",
    description: "Platform polls consent-status until approved",
  },
  {
    endpoint: "GET /api/partner/child-controls/:email",
    description:
      "Once approved, platform reads controls via child-controls endpoint",
  },
];

const apiPreview = `POST /api/partner/verify-age
{
  "childEmail": "alice@example.com",
  "platformId": "your-platform",
  "apiKey": "your-api-key"
}

Response:
{
  "verified": true,
  "age": 12,
  "meetsMinAge": false,
  "minAge": 13,
  "parentConsent": null
}`;

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    period: null,
    features: ["100 verifications/month", "Basic API access", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$99",
    period: "/mo",
    features: [
      "10,000 verifications/month",
      "Priority support",
      "Webhook notifications",
      "Usage analytics dashboard",
    ],
    cta: "Get API Key",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: null,
    features: [
      "Unlimited verifications",
      "Dedicated support",
      "Custom integration",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const aspirationalPlatforms = ["Spotify", "DoorDash", "Instacart"];

type SandboxEndpoint = "verify-age" | "request-consent" | "consent-status" | "child-controls" | "report-activity";

interface EndpointConfig {
  label: string;
  method: string;
  pathTemplate: (apiKey: string, requestId: string, childEmail: string, platformId: string) => string;
  hasBody: boolean;
  defaultBody: string;
  extraInputs?: { key: string; label: string; placeholder: string }[];
}

const endpointConfigs: Record<SandboxEndpoint, EndpointConfig> = {
  "verify-age": {
    label: "Verify Age",
    method: "POST",
    pathTemplate: () => "/api/partner/verify-age",
    hasBody: true,
    defaultBody: JSON.stringify(
      { childEmail: "alice@omnid.io", platformId: "spotify", apiKey: "omnid-demo-key-2026" },
      null,
      2
    ),
  },
  "request-consent": {
    label: "Request Consent",
    method: "POST",
    pathTemplate: () => "/api/partner/request-consent",
    hasBody: true,
    defaultBody: JSON.stringify(
      {
        childEmail: "alice@omnid.io",
        parentEmail: "parent@omnid.io",
        platformId: "spotify",
        platformName: "Spotify",
        requestedPermissions: ["music_streaming", "playlist_creation"],
        apiKey: "omnid-demo-key-2026",
      },
      null,
      2
    ),
  },
  "consent-status": {
    label: "Check Consent Status",
    method: "GET",
    pathTemplate: (apiKey: string, requestId: string) =>
      `/api/partner/consent-status/${requestId || ":requestId"}?apiKey=${apiKey}`,
    hasBody: false,
    defaultBody: "",
    extraInputs: [
      { key: "requestId", label: "Request ID", placeholder: "Paste requestId from Step 2" },
    ],
  },
  "child-controls": {
    label: "Get Child Controls",
    method: "GET",
    pathTemplate: (apiKey: string, _requestId: string, childEmail: string, platformId: string) =>
      `/api/partner/child-controls/${childEmail}?platformId=${platformId}&apiKey=${apiKey}`,
    hasBody: false,
    defaultBody: "",
  },
  "report-activity": {
    label: "Report Activity",
    method: "POST",
    pathTemplate: () => "/api/partner/report-activity",
    hasBody: true,
    defaultBody: JSON.stringify(
      {
        childEmail: "alice@omnid.io",
        platformId: "spotify",
        activityType: "playlist_created",
        description: "Created playlist: My Favorites",
        apiKey: "omnid-demo-key-2026",
      },
      null,
      2
    ),
  },
};

const endpointKeys: SandboxEndpoint[] = [
  "verify-age",
  "request-consent",
  "consent-status",
  "child-controls",
  "report-activity",
];

export default function Partners() {
  const [sandboxApiKey, setSandboxApiKey] = useState("omnid-demo-key-2026");
  const [selectedEndpoint, setSelectedEndpoint] = useState<SandboxEndpoint>("verify-age");
  const [requestBodies, setRequestBodies] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const key of endpointKeys) {
      initial[key] = endpointConfigs[key].defaultBody;
    }
    return initial;
  });
  const [sandboxRequestId, setSandboxRequestId] = useState("");
  const [sandboxChildEmail] = useState("alice@omnid.io");
  const [sandboxPlatformId] = useState("spotify");
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  const currentConfig = endpointConfigs[selectedEndpoint];
  const currentPath = currentConfig.pathTemplate(sandboxApiKey, sandboxRequestId, sandboxChildEmail, sandboxPlatformId);
  const currentUrl = `${API_BASE}${currentPath}`;

  async function handleSendRequest() {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxStatus(null);
    setSandboxError(null);

    try {
      const options: RequestInit = {
        method: currentConfig.method,
        headers: { "Content-Type": "application/json" },
      };
      if (currentConfig.hasBody) {
        options.body = requestBodies[selectedEndpoint];
      }
      const res = await fetch(currentUrl, options);
      setSandboxStatus(res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setSandboxResponse(JSON.stringify(json, null, 2));
      } catch {
        setSandboxResponse(text);
      }
    } catch {
      setSandboxError("Backend not available. Deploy the OmnID API to test live endpoints.");
    } finally {
      setSandboxLoading(false);
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 relative">
          {/* Animated gradient glow behind hero */}
          <div className="absolute -inset-10 bg-gradient-to-br from-omn-primary/[0.07] via-transparent to-omn-accent/[0.07] gradient-animate rounded-3xl blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-omn-primary/20 border border-omn-primary/30 rounded-full mb-4">
              <span className="text-sm font-medium text-omn-primary-light">
                For Platforms
              </span>
            </div>
            <h1 className="text-4xl font-bold text-omn-heading mb-3">
              OmnID for Platforms
            </h1>
            <p className="text-lg text-omn-accent mb-4">
              COPPA-compliant child identity verification, built for you.
            </p>
            <p className="text-omn-text max-w-2xl mx-auto mb-8">
              Stop building child safety infrastructure from scratch. OmnID
              provides verified age, parental consent, and content controls
              through a single API.
            </p>
            <div className="flex items-center justify-center gap-4">
              <NavLink
                to="/partners/docs"
                className="px-6 py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-omn-primary/20"
              >
                View API Docs
              </NavLink>
              <a
                href="mailto:partners@omnid.app"
                className="px-6 py-3 bg-omn-surface border border-omn-border rounded-xl text-sm font-medium text-omn-text hover:text-omn-heading hover:border-omn-primary/50 transition-all duration-200"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>

        {/* The Problem */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-2">
            The Problem
          </h2>
          <p className="text-sm text-omn-text mb-4">
            If your platform serves users under 13, you are legally required to
            comply with COPPA. Most platforms struggle with this.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problems.map((problem) => (
              <div
                key={problem}
                className="flex gap-3 p-3 bg-omn-bg rounded-lg"
              >
                <div className="w-6 h-6 bg-omn-danger/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-omn-danger">!</span>
                </div>
                <p className="text-sm text-omn-text">{problem}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What OmnID Provides */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-6 text-center">
            What OmnID Provides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-omn-surface border border-omn-border rounded-xl p-5 card-hover"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-omn-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-sm text-omn-primary-light">
                      {"\u2713"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-omn-heading">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs text-omn-text leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-6">
            How It Works
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-omn-primary to-omn-accent rounded-full flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                  <span className="text-sm font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="pt-1">
                  <p className="text-sm text-omn-heading">
                    {step.description}
                  </p>
                  {step.endpoint && (
                    <code className="text-xs text-omn-accent font-mono mt-1 inline-block">
                      {step.endpoint}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Preview */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-4 text-center">
            API Preview
          </h2>
          <div className="bg-[#0d1117] border border-omn-border rounded-xl p-6 overflow-x-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]">
            <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">
              {apiPreview}
            </pre>
          </div>
        </div>

        {/* Try the API — Interactive Sandbox */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-2 text-center">
            Try the API
          </h2>
          <p className="text-sm text-omn-text text-center mb-6">
            Make real API calls against the OmnID sandbox. Pick an endpoint,
            edit the request, and hit Send.
          </p>

          <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
            {/* API Key input */}
            <div className="mb-5">
              <label
                htmlFor="sandbox-api-key"
                className="block text-xs font-medium text-omn-text mb-1"
              >
                Demo API Key
              </label>
              <input
                id="sandbox-api-key"
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading font-mono focus:outline-none focus:border-omn-primary/50"
              />
            </div>

            {/* Endpoint tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {endpointKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedEndpoint(key);
                    setSandboxResponse(null);
                    setSandboxStatus(null);
                    setSandboxError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedEndpoint === key
                      ? "bg-omn-primary/20 text-omn-primary-light border border-omn-primary/40"
                      : "bg-omn-bg text-omn-text border border-omn-border hover:border-omn-primary/30"
                  }`}
                >
                  {endpointConfigs[key].label}
                </button>
              ))}
            </div>

            {/* Method + URL */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  currentConfig.method === "GET"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {currentConfig.method}
              </span>
              <code className="text-xs text-omn-accent font-mono break-all">
                {currentUrl}
              </code>
            </div>

            {/* Extra inputs (e.g. requestId for consent-status) */}
            {currentConfig.extraInputs?.map((input) => (
              <div key={input.key} className="mb-3">
                <label className="block text-xs font-medium text-omn-text mb-1">
                  {input.label}
                </label>
                <input
                  type="text"
                  value={input.key === "requestId" ? sandboxRequestId : ""}
                  onChange={(e) => {
                    if (input.key === "requestId") setSandboxRequestId(e.target.value);
                  }}
                  placeholder={input.placeholder}
                  className="w-full px-3 py-2 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading font-mono placeholder:text-omn-text/40 focus:outline-none focus:border-omn-primary/50"
                />
                <p className="text-xs text-omn-text/60 mt-1">
                  Run "Request Consent" first and copy the requestId from the
                  response.
                </p>
              </div>
            ))}

            {/* Request body textarea */}
            {currentConfig.hasBody && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-omn-text mb-1">
                  Request Body
                </label>
                <textarea
                  value={requestBodies[selectedEndpoint]}
                  onChange={(e) =>
                    setRequestBodies((prev) => ({
                      ...prev,
                      [selectedEndpoint]: e.target.value,
                    }))
                  }
                  rows={
                    (requestBodies[selectedEndpoint] || "").split("\n").length +
                    1
                  }
                  className="w-full px-4 py-3 bg-[#0d1117] border border-omn-border rounded-lg text-sm text-green-400 font-mono leading-relaxed resize-y focus:outline-none focus:border-omn-primary/50"
                />
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSendRequest}
              disabled={sandboxLoading}
              className="px-5 py-2 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-omn-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sandboxLoading ? "Sending..." : "Send Request"}
            </button>

            {/* Response area */}
            {(sandboxResponse || sandboxError) && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-omn-text">
                    Response
                  </span>
                  {sandboxStatus !== null && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        sandboxStatus >= 200 && sandboxStatus < 300
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {sandboxStatus}
                    </span>
                  )}
                </div>
                <div className="bg-[#0d1117] border border-omn-border rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                    {sandboxError ? (
                      <span className="text-red-400">{sandboxError}</span>
                    ) : (
                      <span className="text-green-400">{sandboxResponse}</span>
                    )}
                  </pre>
                </div>
              </div>
            )}

            {sandboxLoading && (
              <div className="mt-5 flex items-center gap-2 text-sm text-omn-text">
                <div className="w-4 h-4 border-2 border-omn-primary/30 border-t-omn-primary rounded-full animate-spin" />
                Waiting for response...
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-6 text-center">
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl flex flex-col ${
                  tier.highlighted
                    ? "bg-omn-primary/10 border-2 border-omn-primary/50 p-6 md:-mt-3 md:mb-[-12px] shadow-[0_0_30px_rgba(59,130,246,0.12)] relative"
                    : "bg-omn-surface border border-omn-border p-5 card-hover"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-omn-primary to-omn-accent text-white text-xs font-semibold rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-omn-heading mb-1">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-omn-heading">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-omn-text">{tier.period}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-omn-text">
                      <span className="text-omn-success shrink-0">
                        {"\u2713"}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:partners@omnid.app"
                  className={`block text-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-omn-primary to-omn-accent text-white hover:shadow-lg hover:shadow-omn-primary/20"
                      : "bg-omn-bg border border-omn-border text-omn-text hover:text-omn-heading hover:border-omn-primary/50"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Already Integrated (Coming Soon) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mb-12 text-center">
          <h2 className="text-xl font-semibold text-omn-heading mb-2">
            Already Integrated
          </h2>
          <p className="text-xs text-omn-accent mb-6">Coming Soon</p>
          <div className="flex items-center justify-center gap-6 flex-wrap mb-6">
            {aspirationalPlatforms.map((name) => (
              <div
                key={name}
                className="px-5 py-3 bg-omn-bg border border-omn-border rounded-lg"
              >
                <span className="text-sm font-medium text-omn-text">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <a
            href="mailto:partners@omnid.app"
            className="text-sm text-omn-primary-light hover:text-omn-accent transition-colors"
          >
            Your platform here? Get in touch.
          </a>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-omn-heading mb-3">
            Ready to protect your youngest users?
          </h2>
          <p className="text-omn-text mb-6">
            Integrate OmnID in hours, not months.
          </p>
          <a
            href="mailto:partners@omnid.app"
            className="inline-block px-8 py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-medium text-lg transition-all duration-200 hover:shadow-lg hover:shadow-omn-primary/20"
          >
            Get Your API Key
          </a>
          <p className="text-xs text-omn-text mt-3">
            Or email{" "}
            <a
              href="mailto:partners@omnid.app"
              className="text-omn-primary-light hover:text-omn-accent transition-colors"
            >
              partners@omnid.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
