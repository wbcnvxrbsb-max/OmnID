import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Privacy Policy</h1>
      <p className="text-sm text-omn-text mb-8">Last updated: March 15, 2026</p>

      <div className="space-y-8">
        {/* Intro */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <p className="text-sm text-omn-text">
            OmnID ("we," "us," or "our") is a decentralized digital identity platform that aggregates your data across platforms,
            stores identity proofs on-chain, and enables portable reputation. This Privacy Policy explains what data we collect,
            how we store it, and your rights regarding that data. This policy applies to all users of the OmnID website and
            services, including the OmnID mobile application (when available).
          </p>
        </div>

        {/* What We Collect */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">What We Collect</h2>
          <div className="space-y-4">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Identity Information</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Name, email address, and profile picture (from Google OAuth or other supported OAuth providers)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Phone number (optional, for multi-factor authentication via Firebase)</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Sensitive Personal Information</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                  Social Security Number -- <span className="font-medium text-omn-heading">ONLY a cryptographic hash (keccak256) is stored</span>.
                  The raw SSN is processed entirely in your browser and never transmitted or stored. We collect your SSN
                  solely for one-time identity verification to prevent duplicate accounts.
                </li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Platform Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Connected platform profiles, ratings, reviews, and transaction history (auto-imported with your consent)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Reputation scores and platform-specific metrics</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Financial Information</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Bank account details (account number, routing number, institution name) collected through Plaid for bank account linking</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Payment card information (processed by Stripe; we do not store full card numbers)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cryptocurrency wallet addresses and transaction history</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Subscription and billing information for OmnID Pro</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Device Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Passkey credential IDs (for passwordless authentication via WebAuthn)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Encrypted wallet mnemonic (AES-256-GCM encrypted)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Browser type, device type, and IP address (collected automatically)</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Usage Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Activity logs, connected platforms, feature usage, and interaction history</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Reputation transfer records and associated fees</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Purpose of Collection */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Why We Collect Your Data</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Identity Verification:</span> To verify your identity, prevent duplicate accounts, and ensure one person per account using SSN hashing.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Service Delivery:</span> To aggregate your platform data, calculate reputation scores, and enable reputation portability.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Payments and Financial Services:</span> To process Pro subscriptions, facilitate crypto transactions, bank linking, and payment bridging.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Parental Controls:</span> To verify parent-child relationships and enforce age-appropriate content controls.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Security:</span> To authenticate users, detect fraud, and protect against unauthorized access.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Communication:</span> To send service-related emails (account verification, security alerts, policy changes, and subscription receipts).</span></li>
          </ul>
        </div>

        {/* Children's Data (COPPA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Children's Privacy (COPPA Compliance)</h2>
          <div className="space-y-4 text-sm text-omn-text">
            <p>
              OmnID complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal
              information from children under 13 without verifiable parental consent. Children under 18 cannot create accounts
              independently -- all child accounts must be created by a verified parent or legal guardian.
            </p>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">What We Collect From Children</h3>
              <p className="mb-2">We collect only the minimum data necessary to operate a child account:</p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Child's name and date of birth (provided by the parent)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>A cryptographic hash of the child's SSN (for identity verification only; raw SSN is never stored or transmitted)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Platform permission settings and content control preferences (set by the parent)</li>
              </ul>
              <p className="mt-2 font-medium text-omn-heading">
                We do not collect more information from a child than is reasonably necessary to provide the service.
              </p>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Verifiable Parental Consent</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The parent must have a verified OmnID account (including SSN verification) before registering a child.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The parent must provide the child's identity information and explicitly consent to the child's account creation through the Children's Panel.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We verify the parent-child relationship through identity verification of both parent and child.</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Parental Rights</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Review:</span> Parents can view all data associated with their child's account at any time through the Children's Panel.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Delete:</span> Parents can delete their child's account and all associated data at any time.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Revoke Consent:</span> Parents can revoke consent and request deletion of their child's data by removing the child's account or by contacting us at <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light">privacy@omnid.app</a>.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Refuse Further Collection:</span> Parents can refuse to permit further collection of their child's data, which may result in termination of the child's account.</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">How Children's Data Is Used</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We do <span className="font-medium text-omn-heading">not</span> use children's data for behavioral advertising or targeted marketing.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We do <span className="font-medium text-omn-heading">not</span> sell, rent, or share children's personal information with third parties for commercial purposes.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children's data is subject to the same encryption and security measures as adult data.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Platform access for children is controlled entirely by the parent through per-platform content controls.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>AI-powered content filtering (when available) operates based on parent-configured settings only.</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Auto-Ejection at Age 18</h3>
              <p>
                When a child turns 18, their account is automatically converted to an independent adult account.
                The parent loses access to the child's data, and the now-adult user gains full control of their own account
                and data, subject to the standard terms for adult users.
              </p>
            </div>
          </div>
        </div>

        {/* How We Store Data */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">How We Store Data</h2>
          <div className="space-y-3">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Browser localStorage</h3>
              <p className="text-sm text-omn-text">Encrypted where sensitive. Stored on your device only.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Firebase Firestore</h3>
              <p className="text-sm text-omn-text">Synced for cross-device access, secured by authentication rules.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Base Sepolia Blockchain (Testnet) / Base Mainnet (Future)</h3>
              <p className="text-sm text-omn-text">Only cryptographic hashes are stored on-chain -- no personal information. On-chain data is immutable and cannot be deleted.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Wallet Encryption</h3>
              <p className="text-sm text-omn-text">Wallet mnemonics are encrypted with AES-256-GCM before storage.</p>
            </div>
          </div>
        </div>

        {/* What We Never Do */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">What We Never Do</h2>
          <div className="bg-red-900/10 border border-red-700/20 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-omn-text">
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never store raw SSNs -- only cryptographic hashes</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never sell personal data to third parties</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never "share" personal information for cross-context behavioral advertising</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never share personal information without explicit consent</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never store unencrypted sensitive data in the cloud</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never use children's data for behavioral advertising or targeted marketing</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never use reputation scores as consumer reports under the FCRA</li>
            </ul>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Third-Party Services</h2>
          <p className="text-sm text-omn-text mb-3">OmnID integrates with the following third-party services. Each service has its own privacy policy that governs your data when processed by that service:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Google OAuth</p>
              <p className="text-xs text-omn-text">Authentication and identity verification. Receives: access to your Google profile (name, email, picture).</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Stripe</p>
              <p className="text-xs text-omn-text">Payment processing for Pro subscriptions. Receives: email, payment card details. OmnID does not store your full card numbers.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Plaid</p>
              <p className="text-xs text-omn-text">Bank account linking. Receives: your bank login credentials (processed by Plaid, not stored by OmnID). Returns: account and routing numbers, institution name, balance information.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Firebase (Google Cloud)</p>
              <p className="text-xs text-omn-text">Cloud sync, authentication, and phone verification. Receives: account data, phone number (if provided).</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Base Blockchain (Coinbase)</p>
              <p className="text-xs text-omn-text">On-chain identity and reputation storage. Receives: only cryptographic hashes (no personal data).</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">LI.FI</p>
              <p className="text-xs text-omn-text">Cross-chain swap aggregation. Receives: wallet address and transaction data for swap execution.</p>
            </div>
          </div>
        </div>

        {/* SSN Specific Disclosure */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">SSN Specific Disclosure</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 space-y-3 text-sm text-omn-text">
            <p>
              Your Social Security Number is collected <span className="font-medium text-omn-heading">solely for identity verification</span> purposes,
              for both adult and child accounts.
            </p>
            <p>
              Your SSN is hashed using the <span className="font-mono text-omn-accent">keccak256</span> cryptographic hash function
              entirely within your browser before any network transmission occurs. Only the resulting hash is stored on-chain.
            </p>
            <p>
              The raw SSN exists only in browser memory for a matter of seconds during the verification step and is
              cleared from memory immediately after hashing.
            </p>
            <p>
              For parent/child verification, both the parent's and child's SSNs are verified through the same secure
              hashing process. At no point is a raw SSN transmitted over the network or written to any persistent storage.
            </p>
          </div>
        </div>

        {/* SSN Protection -- State Law Compliance */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">SSN Protection and State Law Compliance</h2>
          <div className="space-y-3 text-sm text-omn-text">
            <p>
              OmnID implements protections for Social Security Numbers that meet or exceed the requirements of state SSN
              protection laws, including California Civil Code Section 1798.85, New York General Business Law Section 399-ddd,
              Massachusetts 201 CMR 17.00, Connecticut Public Act 08-167, and similar statutes.
            </p>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Our SSN Safeguards</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We never publicly display, print, or embed SSNs (or their hashes) in any communication visible to the user.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We never transmit raw SSNs over the internet -- hashing is performed client-side in your browser.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We never require SSNs to access a website (the SSN is used solely for one-time identity verification).</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Raw SSNs are purged from browser memory immediately after hashing is complete.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>On-chain hashes are one-way cryptographic functions and cannot be reversed to reveal the original SSN.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Data (GLBA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Financial Data Privacy Notice (GLBA)</h2>
          <div className="space-y-3 text-sm text-omn-text">
            <p>
              To the extent that OmnID's services involve the collection of financial information (such as bank account
              details through Plaid, payment card information through Stripe, or cryptocurrency wallet and transaction data),
              the following disclosures are made in accordance with the Gramm-Leach-Bliley Act (GLBA):
            </p>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Financial Information We Collect</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Bank account and routing numbers, institution name, and balance data (via Plaid)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Payment card information for subscription payments (processed by Stripe)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cryptocurrency wallet addresses, transaction history, and token balances</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Payment bridging transaction records (virtual card transactions, crypto-to-fiat conversions)</li>
              </ul>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">How We Share Financial Information</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>With Plaid: to authenticate and retrieve bank account data at your direction.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>With Stripe: to process Pro subscription payments.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>With LI.FI: wallet address and transaction data to execute cross-chain swaps at your direction.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We do <span className="font-medium text-omn-heading">not</span> share your financial information with non-affiliated third parties for their own marketing purposes.</li>
              </ul>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Opt-Out Rights</h3>
              <p>
                You may opt out of financial data sharing by disconnecting your bank account through the Payments page,
                or by contacting us at <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light">privacy@omnid.app</a>.
                Note that certain financial data sharing is required for the core service to function (e.g., sharing wallet
                addresses with the blockchain for transactions you initiate).
              </p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Safeguards</h3>
              <p>
                We maintain administrative, technical, and physical safeguards to protect your financial information, including
                encryption in transit (TLS) and at rest (AES-256-GCM for sensitive data), access controls, and regular
                security reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Your Rights</h2>
          <div className="space-y-3">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Access</h3>
              <p className="text-sm text-omn-text">View all your data at any time in the Dashboard.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Correct</h3>
              <p className="text-sm text-omn-text">Request correction of inaccurate personal information by contacting us.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Delete</h3>
              <p className="text-sm text-omn-text">The "Delete My Data" button on the Dashboard permanently removes all your data from our systems. Note that on-chain hashes cannot be deleted due to the immutable nature of blockchain, but they contain no personal information.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Portability</h3>
              <p className="text-sm text-omn-text">Your on-chain identity is portable across any platform that supports OmnID. You can request a copy of your data in a machine-readable format.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Consent</h3>
              <p className="text-sm text-omn-text">You can withdraw consent at any time by deleting your account. Withdrawal of consent does not affect the lawfulness of processing prior to withdrawal.</p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Data Retention</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              Your data is retained until you choose to delete it. On-chain hashes are permanent and immutable, but they
              contain no personal information and cannot be used to reconstruct your identity data.
            </p>
            <p>
              When you delete your account, we will remove all personal data from our servers within 30 days, except where
              retention is required by law (e.g., financial transaction records may be retained for up to 5 years as required
              by the Bank Secrecy Act).
            </p>
          </div>
        </div>

        {/* Data Breach Notification */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Data Breach Notification</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              In the event of a data breach involving your personal information, we will notify affected users and applicable
              regulatory authorities as required by federal and state breach notification laws (including California Civil
              Code Section 1798.82, New York General Business Law Section 899-aa, and similar statutes in all applicable
              jurisdictions).
            </p>
            <p>
              Notifications will be sent without unreasonable delay, and no later than the timeframes required by applicable
              law (e.g., 60 days for most states, 72 hours for GDPR). Notifications will include the nature of the breach,
              the types of data involved, and steps you can take to protect yourself.
            </p>
          </div>
        </div>

        {/* FCRA Disclaimer */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Fair Credit Reporting Act (FCRA) Disclaimer</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 text-sm text-omn-text space-y-2">
            <p>
              OmnID is <span className="font-medium text-omn-heading">not a consumer reporting agency</span> as defined
              by the Fair Credit Reporting Act (15 U.S.C. Section 1681 et seq.). The reputation scores and platform data
              aggregated through OmnID are <span className="font-medium text-omn-heading">not consumer reports</span> and
              must not be used as a factor in determining eligibility for credit, insurance, employment, housing, or any
              other purpose covered by the FCRA.
            </p>
            <p>
              Users and third-party platforms that integrate with OmnID agree not to use OmnID reputation data for any
              FCRA-regulated purpose.
            </p>
          </div>
        </div>

        {/* California Residents (CCPA/CPRA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">California Residents (CCPA/CPRA)</h2>
          <div className="space-y-4 text-sm text-omn-text">
            <p>
              If you are a California resident, you have the following rights under the California Consumer Privacy Act
              as amended by the California Privacy Rights Act (CCPA/CPRA):
            </p>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Your CCPA/CPRA Rights</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Know:</span> You can request what personal information we collect, the sources, the business purposes, and the categories of third parties with whom we share it.</span></li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Delete:</span> You can request deletion of your personal information, subject to certain exceptions.</span></li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Correct:</span> You can request correction of inaccurate personal information.</span></li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Opt-Out of Sale/Sharing:</span> We do not sell or "share" (as defined by the CPRA) your personal information for cross-context behavioral advertising. No opt-out is necessary, but you may still contact us if you have concerns.</span></li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Limit Use of Sensitive Personal Information:</span> We collect sensitive personal information (SSN) solely for identity verification. You have the right to limit the use of sensitive personal information to what is necessary for the service. We already limit our use accordingly.</span></li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Non-Discrimination:</span> We will not discriminate against you for exercising any of your CCPA/CPRA rights. You will not receive different pricing or service quality for exercising these rights.</span></li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Categories of Personal Information Collected (Past 12 Months)</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Identifiers:</span> Name, email, phone number, SSN hash, wallet addresses</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Financial Information:</span> Bank account details (via Plaid), payment card info (via Stripe), crypto balances and transaction history</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Internet/Network Activity:</span> Activity logs, connected platforms, browser/device info</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Sensitive Personal Information:</span> Social Security Number (hashed only), government ID verification</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Financial Incentive Disclosure</h3>
              <p>
                OmnID Pro ($9.99/month or $99/year) provides enhanced features including real-time sync, a verified badge,
                priority transfers, and advanced analytics. The price of OmnID Pro reflects the additional services provided
                and is not a financial incentive related to the collection or retention of personal information.
                Free-tier users retain full access to core OmnID features. We calculate the value of the Pro program based
                on the cost of providing the additional services.
              </p>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">How to Submit Requests</h3>
              <p>
                To exercise your CCPA/CPRA rights, you may: (1) use the "Delete My Data" button on your Dashboard,
                (2) email us at <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light">privacy@omnid.app</a>,
                or (3) submit a request through our contact form. We will verify your identity before processing any request
                and will respond within 45 days (with a possible 45-day extension if reasonably necessary).
              </p>
            </div>
          </div>
        </div>

        {/* Email Communications (CAN-SPAM) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Email Communications (CAN-SPAM Compliance)</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              We may send you service-related emails including account verification, security alerts, policy updates,
              subscription receipts, and platform notifications. In compliance with the CAN-SPAM Act:
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>All marketing or promotional emails will include a clear opt-out / unsubscribe mechanism.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>We will honor opt-out requests within 10 business days.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>All emails will accurately identify OmnID as the sender and include our physical mailing address.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Transactional emails (security alerts, account changes, payment receipts) are not subject to opt-out as they are required for service operation.</li>
            </ul>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Accessibility</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              OmnID is committed to making our platform accessible to all users, including those with disabilities, in
              accordance with the Americans with Disabilities Act (ADA) and Web Content Accessibility Guidelines (WCAG) 2.1
              Level AA standards. If you encounter accessibility barriers on our platform, please contact us at{" "}
              <a href="mailto:accessibility@omnid.app" className="text-omn-primary hover:text-omn-primary-light">accessibility@omnid.app</a>{" "}
              and we will make reasonable efforts to provide the information in an accessible format.
            </p>
            <p>
              This Privacy Policy is available in alternative formats upon request.
            </p>
          </div>
        </div>

        {/* EU Residents (GDPR) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">EU Residents (GDPR)</h2>
          <p className="text-sm text-omn-text mb-3">
            If you are a resident of the European Union, the following applies:
          </p>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Legal Basis:</span> We process your data based on your explicit consent.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Data Processing Location:</span> Your data is processed in the United States.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Your Rights:</span> You have the right to access, rectify, erase, restrict processing, port your data, and object to processing.</span></li>
          </ul>
        </div>

        {/* Changes to Policy */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Changes to This Privacy Policy</h2>
          <p className="text-sm text-omn-text">
            We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an
            updated "Last updated" date. If we make material changes, we will notify you via email or through a prominent
            notice on our platform at least 30 days before the changes take effect. Your continued use of the Service after
            changes take effect constitutes acceptance of the updated policy.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Contact</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              If you have any questions about this Privacy Policy, your data, or wish to exercise any of your rights, please contact us:
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>Email: <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">privacy@omnid.app</a></span>
              </li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>COPPA inquiries: <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">privacy@omnid.app</a> (subject line: "COPPA Request")</span>
              </li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>Accessibility: <a href="mailto:accessibility@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">accessibility@omnid.app</a></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="flex gap-3 pb-8">
          <Link
            to="/"
            className="px-5 py-2.5 bg-omn-surface border border-omn-border text-sm font-medium text-omn-heading rounded-lg hover:border-omn-primary/50 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/terms"
            className="px-5 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
