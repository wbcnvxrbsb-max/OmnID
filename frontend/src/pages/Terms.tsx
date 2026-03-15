import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Terms of Service</h1>
      <p className="text-sm text-omn-text mb-8">Last updated: March 15, 2026</p>

      <div className="space-y-8">
        {/* Acceptance of Terms */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Acceptance of Terms</h2>
          <p className="text-sm text-omn-text">
            By accessing or using OmnID ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, do not use the Service. Your continued use of the Service
            following any changes to these terms constitutes acceptance of those changes.
          </p>
        </div>

        {/* Description of Service */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Description of Service</h2>
          <p className="text-sm text-omn-text">
            OmnID is a decentralized digital identity platform that aggregates user data across platforms,
            stores identity proofs on-chain via the Base Sepolia blockchain, and enables portable reputation.
            The Service allows users to create a unified digital identity, link accounts from various platforms,
            manage payments, and build a verifiable reputation score.
          </p>
        </div>

        {/* Account Registration */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Account Registration</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You must provide accurate and complete information during registration.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Government ID (SSN) verification is required to complete registration.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>A passkey is required for account security and authentication.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Only one account per person is permitted.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You are responsible for maintaining the security of your account credentials.</li>
          </ul>
        </div>

        {/* SSN Usage */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">SSN Usage</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 space-y-3 text-sm text-omn-text">
            <p>
              Your Social Security Number is collected for identity verification purposes only, for both adult and child accounts.
              Only a cryptographic hash (keccak256) of your SSN is stored. The raw SSN is never transmitted over any network
              or written to any persistent storage.
            </p>
            <p>
              OmnID does not act as a credit reporting agency. Your SSN hash is used solely to verify uniqueness of identity
              and to prevent duplicate accounts.
            </p>
          </div>
        </div>

        {/* Children's Accounts */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Children's Accounts</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children's accounts must be created by a parent or legal guardian through the Children's Panel.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Both parent and child identity are verified via SSN verification.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The parent maintains control over the child's account until the child turns 18, at which point the child is automatically ejected to an independent adult account.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Age restrictions are enforced per platform rules.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parents can set content controls on a per-platform basis.</li>
          </ul>
        </div>

        {/* Blockchain */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Blockchain</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 space-y-3 text-sm text-omn-text">
            <p>
              Data written to the blockchain is <span className="font-medium text-omn-heading">immutable</span>. While your account
              can be deactivated, blockchain hashes cannot be deleted or modified. No personal information is stored on-chain —
              only cryptographic hashes that cannot be reversed to reveal your identity data.
            </p>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Payments</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Pro subscriptions and payment processing are handled via Stripe.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Refunds are handled on a case-by-case basis. Contact us for refund requests.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
              <span className="font-medium text-omn-heading">Test mode disclaimer:</span> The Service is currently operating in test mode.
              No real charges are processed during the test period.
            </li>
          </ul>
        </div>

        {/* Wallet & Crypto */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Wallet & Crypto</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You are solely responsible for safeguarding your wallet seed phrase. OmnID cannot recover lost wallets.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Testnet tokens (Base Sepolia ETH) have no real monetary value.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is not responsible for any loss of funds due to user error or compromised credentials.</li>
          </ul>
        </div>

        {/* Prohibited Use */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Prohibited Use</h2>
          <div className="bg-red-900/10 border border-red-700/20 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-omn-text">
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Providing false identity information</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Using the Service for fraud or deception</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Circumventing age restrictions or parental controls</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Registering children without legal guardianship</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Creating multiple accounts for the same person</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Attempting to reverse-engineer cryptographic hashes</li>
            </ul>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Limitation of Liability</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 text-sm text-omn-text space-y-3">
            <p className="uppercase font-medium text-omn-heading">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p>
              To the maximum extent permitted by applicable law, OmnID shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Disclaimer</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is currently in <span className="font-medium text-omn-heading">beta/testnet</span>. Features may change without notice.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The Service does not provide financial advice.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is not a credit reporting agency.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Reputation scores are informational and should not be used as the sole basis for any financial or legal decision.</li>
          </ul>
        </div>

        {/* Changes to Terms */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Changes to Terms</h2>
          <p className="text-sm text-omn-text">
            We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page
            with an updated "Last updated" date. Your continued use of the Service after any changes constitutes
            acceptance of the new terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Governing Law</h2>
          <p className="text-sm text-omn-text">
            These Terms shall be governed by and construed in accordance with the laws of the State of California,
            United States, without regard to its conflict of law provisions.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Contact</h2>
          <p className="text-sm text-omn-text">
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:legal@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">
              legal@omnid.app
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
            to="/privacy"
            className="px-5 py-2.5 bg-omn-primary hover:bg-omn-primary-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
