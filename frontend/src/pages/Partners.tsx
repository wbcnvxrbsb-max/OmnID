import { NavLink } from "react-router-dom";

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

export default function Partners() {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
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
                className="bg-omn-surface border border-omn-border rounded-xl p-5"
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
                <div className="w-8 h-8 bg-omn-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-omn-primary-light">
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
          <div className="bg-[#0d1117] border border-omn-border rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">
              {apiPreview}
            </pre>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-omn-heading mb-6 text-center">
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-5 flex flex-col ${
                  tier.highlighted
                    ? "bg-omn-primary/10 border-2 border-omn-primary/50"
                    : "bg-omn-surface border border-omn-border"
                }`}
              >
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
