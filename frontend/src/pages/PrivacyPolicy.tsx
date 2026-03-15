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
            how we store it, and your rights regarding that data.
          </p>
        </div>

        {/* What We Collect */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">What We Collect</h2>
          <div className="space-y-4">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Identity Information</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Name, email, and profile picture (from Google OAuth)</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Government ID</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                  Social Security Number — <span className="font-medium text-omn-heading">ONLY a cryptographic hash (keccak256) is stored</span>.
                  The raw SSN is processed entirely in your browser and never transmitted or stored.
                </li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Platform Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Connected platform profiles, ratings, reviews, and transaction history (auto-imported with your consent)</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Device Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Passkey credential IDs (for passwordless authentication)</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Encrypted wallet mnemonic</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Usage Data</h3>
              <ul className="space-y-1.5 text-sm text-omn-text">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Activity logs and connected platforms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Children's Data (COPPA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Children's Data (COPPA Compliance)</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children under 18 can only be registered through a parent's account via the Children's Panel.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parent/child relationship is verified using SSN verification for both parent and child.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parental consent is required before any child data is collected.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parents can view, modify, and delete their child's data at any time through the Children's Panel.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Child data is subject to the same encryption and security measures as adult data.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parents can delete a child's account at any time.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children are automatically ejected from parental control at age 18.</li>
          </ul>
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
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Base Sepolia Blockchain</h3>
              <p className="text-sm text-omn-text">Only cryptographic hashes are stored on-chain — no personal information.</p>
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
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never store raw SSNs</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never sell personal data to third parties</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never share personal information without explicit consent</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Never store unencrypted sensitive data in the cloud</li>
            </ul>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Third-Party Services</h2>
          <p className="text-sm text-omn-text mb-3">OmnID integrates with the following third-party services:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Google OAuth</p>
              <p className="text-xs text-omn-text">Authentication and identity verification</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Stripe</p>
              <p className="text-xs text-omn-text">Payment processing</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Plaid</p>
              <p className="text-xs text-omn-text">Banking integrations</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Firebase</p>
              <p className="text-xs text-omn-text">Cloud sync and authentication</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-3">
              <p className="text-sm font-medium text-omn-heading">Base Sepolia</p>
              <p className="text-xs text-omn-text">Blockchain identity and reputation storage</p>
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

        {/* Your Rights */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Your Rights</h2>
          <div className="space-y-3">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Access</h3>
              <p className="text-sm text-omn-text">View all your data at any time in the Dashboard.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Delete</h3>
              <p className="text-sm text-omn-text">The "Delete My Data" button on the Dashboard permanently removes all your data from our systems.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Portability</h3>
              <p className="text-sm text-omn-text">Your on-chain identity is portable across any platform that supports OmnID.</p>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-1">Consent</h3>
              <p className="text-sm text-omn-text">You can withdraw consent at any time by deleting your account.</p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Data Retention</h2>
          <p className="text-sm text-omn-text">
            Your data is retained until you choose to delete it. On-chain hashes are permanent and immutable, but they
            contain no personal information and cannot be used to reconstruct your identity data.
          </p>
        </div>

        {/* California Residents (CCPA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">California Residents (CCPA)</h2>
          <p className="text-sm text-omn-text mb-3">
            If you are a California resident, you have the following rights under the California Consumer Privacy Act:
          </p>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Know:</span> You can request what personal information we collect, use, and disclose.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Delete:</span> You can request deletion of your personal information.</span></li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span><span className="font-medium text-omn-heading">Right to Opt-Out:</span> We do not sell personal data, so no opt-out is necessary.</span></li>
          </ul>
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

        {/* Contact */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Contact</h2>
          <p className="text-sm text-omn-text">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">
              privacy@omnid.app
            </a>.
          </p>
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
