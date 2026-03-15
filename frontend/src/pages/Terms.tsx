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
            By accessing or using OmnID ("the Service"), you agree to be bound by these Terms of Service and our{" "}
            <Link to="/privacy" className="text-omn-primary hover:text-omn-primary-light">Privacy Policy</Link>.
            If you do not agree to these terms, do not use the Service. Your continued use of the Service
            following any changes to these terms constitutes acceptance of those changes.
          </p>
        </div>

        {/* Description of Service */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Description of Service</h2>
          <div className="text-sm text-omn-text space-y-3">
            <p>
              OmnID is a decentralized digital identity platform that aggregates user data across platforms,
              stores identity proofs on-chain via the Base blockchain, and enables portable reputation.
              The Service allows users to create a unified digital identity, link accounts from various platforms,
              manage payments, trade cryptocurrency, and build a verifiable reputation score.
            </p>
            <p>Key features of the Service include:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Unified digital identity with SSN-based verification</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Platform data aggregation and reputation portability ($1 fee per reputation transfer)</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parent/child account management with content controls</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cryptocurrency wallet, cross-chain swaps, and crypto transfers</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Payment bridging (use crypto where only traditional cards are accepted)</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Bank account linking via Plaid</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID Pro subscription with enhanced features</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID Academy educational resources</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Third-party platform integration via OmnID sign-in (Partner API)</li>
            </ul>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Eligibility</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You must be at least 18 years old to create an adult OmnID account.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children under 18 may only use OmnID through a parent/guardian-managed child account created via the Children's Panel.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You must be a resident of the United States with a valid Social Security Number to complete identity verification.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>By using the Service, you represent that you meet these eligibility requirements.</li>
          </ul>
        </div>

        {/* Account Registration */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Account Registration</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You must provide accurate and complete information during registration.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Government ID (SSN) verification is required to complete registration.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>A passkey (WebAuthn) is required for account security and authentication.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Only one account per person is permitted.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You are responsible for maintaining the security of your account credentials, passkeys, and wallet seed phrases.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You must notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </div>

        {/* SSN Usage */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">SSN Usage and Identity Verification</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 space-y-3 text-sm text-omn-text">
            <p>
              Your Social Security Number is collected for identity verification purposes only, for both adult and child accounts.
              Only a cryptographic hash (keccak256) of your SSN is stored. The raw SSN is never transmitted over any network
              or written to any persistent storage.
            </p>
            <p>
              OmnID does not act as a credit reporting agency. Your SSN hash is used solely to verify uniqueness of identity
              and to prevent duplicate accounts. We implement Red Flags Rule protections, including monitoring for suspicious
              patterns that may indicate identity theft (e.g., multiple accounts using the same SSN hash, unusual account
              activity following registration).
            </p>
            <p>
              If you believe your identity has been used without your authorization to create an OmnID account, please contact
              us immediately at{" "}
              <a href="mailto:security@omnid.app" className="text-omn-primary hover:text-omn-primary-light">security@omnid.app</a>.
            </p>
          </div>
        </div>

        {/* Children's Accounts (COPPA) */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Children's Accounts</h2>
          <div className="space-y-3 text-sm text-omn-text">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children's accounts must be created by a parent or legal guardian through the Children's Panel.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Both parent and child identity are verified via SSN verification.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The parent maintains full control over the child's account until the child turns 18, at which point the child is automatically ejected to an independent adult account.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Age restrictions are enforced per platform rules. Some platforms require minimum ages that cannot be overridden by parental consent.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parents can set content controls on a per-platform basis (restricted, moderate, or open).</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Parents can review, modify, and delete all child data at any time.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Children under 18 may not access cryptocurrency trading, wallet features, or financial services unless explicitly enabled by their parent for platforms that allow it.</li>
            </ul>
            <p>
              For complete details on children's data practices, see the{" "}
              <Link to="/privacy" className="text-omn-primary hover:text-omn-primary-light">Children's Privacy section of our Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Blockchain */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Blockchain</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 space-y-3 text-sm text-omn-text">
            <p>
              Data written to the blockchain is <span className="font-medium text-omn-heading">immutable</span>. While your account
              can be deactivated, blockchain hashes cannot be deleted or modified. No personal information is stored on-chain --
              only cryptographic hashes that cannot be reversed to reveal your identity data.
            </p>
            <p>
              You acknowledge that blockchain transactions are irreversible. Once a transaction is confirmed on-chain,
              it cannot be undone, modified, or cancelled.
            </p>
          </div>
        </div>

        {/* Fees and Payments */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Fees and Payments</h2>
          <div className="space-y-3 text-sm text-omn-text">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">OmnID Pro Subscription</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Monthly plan: $9.99/month. Yearly plan: $99/year (17% savings).</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Subscriptions are processed through Stripe and auto-renew unless cancelled.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You may cancel at any time. Cancellation takes effect at the end of the current billing period.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Refunds are handled on a case-by-case basis. Contact us for refund requests.</li>
              </ul>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Reputation Transfer Fees</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Transferring your reputation data between platforms costs $1.00 per transfer.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>This fee is charged at the time of transfer and is non-refundable.</li>
              </ul>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Crypto Transaction Fees</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Blockchain transactions incur network gas fees paid to validators, not to OmnID.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cross-chain swaps via LI.FI may incur additional protocol fees as disclosed at the time of transaction.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Payment bridging (crypto-to-card) may involve conversion fees displayed before confirmation.</li>
              </ul>
            </div>
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Test Mode Disclaimer</h3>
              <p>
                <span className="font-medium text-omn-heading">The Service is currently operating in test/beta mode.</span>{" "}
                No real charges are processed during the test period. Testnet tokens (Base Sepolia ETH) have no real
                monetary value. When the Service transitions to mainnet/production, users will be notified and must
                re-accept these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Wallet & Crypto */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Wallet, Crypto, and Financial Services</h2>
          <div className="space-y-3 text-sm text-omn-text">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You are solely responsible for safeguarding your wallet seed phrase (BIP-39 mnemonic). OmnID cannot recover lost wallets.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is not responsible for any loss of funds due to user error, compromised credentials, smart contract vulnerabilities, or blockchain network issues.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cross-chain swaps are executed through the LI.FI protocol. OmnID acts as an interface and is not responsible for swap execution, slippage, or bridge failures.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cryptocurrency values are volatile. OmnID does not provide investment advice or guarantee any returns.</li>
            </ul>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Payment Bridging (Virtual Card)</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The virtual card feature allows you to use crypto holdings at merchants that accept traditional card payments.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Conversion rates and fees are displayed before each transaction and are final upon confirmation.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is not responsible for disputes with merchants. Chargebacks and refunds are subject to the merchant's policies.</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Bank Account Linking</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Bank account linking is facilitated by Plaid. Your bank credentials are processed by Plaid and never stored by OmnID.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>You can disconnect linked bank accounts at any time through the Payments page.</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>By linking your bank account, you authorize Plaid to access your financial information as described in{" "}
                  <a href="https://plaid.com/legal" target="_blank" rel="noopener noreferrer" className="text-omn-primary hover:text-omn-primary-light">Plaid's Privacy Policy</a>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory and Compliance Disclosures */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Regulatory and Compliance Disclosures</h2>
          <div className="space-y-4 text-sm text-omn-text">
            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Money Transmission</h3>
              <p>
                OmnID facilitates cryptocurrency transactions by providing a wallet interface and access to decentralized
                protocols (LI.FI). OmnID does not take custody of user funds at any point -- all wallet keys are held by
                the user and all transactions execute directly on public blockchains.
              </p>
              <p className="mt-2">
                To the extent that any aspect of the Service is determined to constitute money transmission, OmnID will
                obtain all necessary registrations and licenses, including FinCEN Money Services Business (MSB) registration
                and applicable state money transmitter licenses, before offering such features in production. During the
                current testnet/beta phase, no real value is transmitted.
              </p>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Anti-Money Laundering (AML) and Bank Secrecy Act (BSA)</h3>
              <p>
                OmnID is committed to compliance with applicable anti-money laundering laws and the Bank Secrecy Act.
                We implement identity verification (via SSN hashing) as part of our Know Your Customer (KYC) procedures.
                We reserve the right to:
              </p>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Monitor transactions for suspicious activity</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>File Suspicious Activity Reports (SARs) and Currency Transaction Reports (CTRs) as required</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Freeze or terminate accounts suspected of illegal activity</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cooperate with law enforcement investigations as required by law</li>
                <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Retain transaction records for at least 5 years as required by BSA regulations</li>
              </ul>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">Dodd-Frank Act</h3>
              <p>
                To the extent that OmnID's payment bridging features are deemed financial services under the Dodd-Frank
                Wall Street Reform and Consumer Protection Act, OmnID will comply with all applicable consumer protection
                requirements, including transparent fee disclosure and error resolution procedures. Users have the right
                to dispute transactions and request error resolution by contacting{" "}
                <a href="mailto:legal@omnid.app" className="text-omn-primary hover:text-omn-primary-light">legal@omnid.app</a>.
              </p>
            </div>

            <div className="bg-omn-bg border border-omn-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-omn-heading mb-2">FCRA Disclaimer</h3>
              <p>
                OmnID is <span className="font-medium text-omn-heading">not a consumer reporting agency</span> as defined
                by the Fair Credit Reporting Act (15 U.S.C. Section 1681 et seq.). Reputation scores generated by OmnID
                are informational only and must not be used as a factor in determining eligibility for credit, insurance,
                employment, housing, or any other purpose regulated by the FCRA. Users and third-party platforms agree not
                to use OmnID data for any FCRA-regulated purpose.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited Use */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Prohibited Use</h2>
          <div className="bg-red-900/10 border border-red-700/20 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-omn-text">
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Providing false identity information or using another person's SSN</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Using the Service for fraud, deception, money laundering, or terrorist financing</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Circumventing age restrictions or parental controls</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Registering children without legal guardianship</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Creating multiple accounts for the same person</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Attempting to reverse-engineer cryptographic hashes</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Using OmnID reputation data for FCRA-regulated purposes (credit, employment, insurance, housing decisions)</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Structuring transactions to evade reporting thresholds</li>
              <li className="flex items-start gap-2"><span className="text-omn-danger mt-0.5">x</span>Using the Service in violation of any applicable laws, including OFAC sanctions</li>
            </ul>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Intellectual Property</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              The OmnID name, logo, and all related trademarks, service marks, and trade names are the property of OmnID.
              The Service's design, code, features, and content (excluding user-generated content) are protected by
              copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of your personal data and platform data that you import into OmnID. By using the Service,
              you grant OmnID a limited, non-exclusive license to process, store, and display your data solely for the
              purpose of providing the Service to you.
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Limitation of Liability</h2>
          <div className="bg-omn-bg border border-omn-border rounded-lg p-4 text-sm text-omn-text space-y-3">
            <p className="uppercase font-medium text-omn-heading">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p>
              To the maximum extent permitted by applicable law, OmnID shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
            <p>
              In no event shall OmnID's total aggregate liability exceed the greater of (a) the amount you have paid OmnID
              in the 12 months preceding the claim, or (b) one hundred dollars ($100).
            </p>
          </div>
        </div>

        {/* Indemnification */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Indemnification</h2>
          <p className="text-sm text-omn-text">
            You agree to indemnify, defend, and hold harmless OmnID and its officers, directors, employees, and agents from
            and against any claims, damages, losses, liabilities, and expenses (including reasonable attorney's fees) arising
            out of or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any
            third-party rights, including intellectual property rights; or (d) any content or data you submit through the Service.
          </p>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Dispute Resolution</h2>
          <div className="text-sm text-omn-text space-y-3">
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall first be
              attempted to be resolved through good-faith negotiation. If the dispute is not resolved within 30 days,
              either party may submit the dispute to binding arbitration administered by the American Arbitration Association (AAA)
              under its Consumer Arbitration Rules.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Arbitration will be conducted in the State of California.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The arbitrator's decision shall be final and binding.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Class Action Waiver:</span> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span><span className="font-medium text-omn-heading">Small Claims Exception:</span> Either party may bring an individual action in small claims court for disputes within the court's jurisdictional amount.</li>
            </ul>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Disclaimers</h2>
          <ul className="space-y-2 text-sm text-omn-text">
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is currently in <span className="font-medium text-omn-heading">beta/testnet</span>. Features may change, be modified, or be discontinued without notice.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The Service does not provide financial, investment, tax, or legal advice.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID is <span className="font-medium text-omn-heading">not a consumer reporting agency</span> under the FCRA.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Reputation scores are informational and should not be used as the sole basis for any financial, legal, employment, or housing decision.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>Cryptocurrency trading involves substantial risk of loss. Past performance does not guarantee future results.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>OmnID does not guarantee the accuracy, completeness, or reliability of data imported from third-party platforms.</li>
            <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>The Service depends on third-party providers (Google, Stripe, Plaid, Firebase, LI.FI, blockchain networks) whose availability we do not control.</li>
          </ul>
        </div>

        {/* Termination */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Termination</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>
              You may terminate your account at any time by using the "Delete My Data" feature on the Dashboard or by
              contacting us. We may suspend or terminate your account at any time for violation of these Terms, suspected
              illegal activity, or as required by law.
            </p>
            <p>
              Upon termination: (a) your right to use the Service ceases immediately; (b) we will delete your personal data
              in accordance with our Privacy Policy; (c) on-chain hashes will remain on the blockchain but contain no
              personal information; (d) any active Pro subscription will be cancelled.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Changes to Terms</h2>
          <p className="text-sm text-omn-text">
            We reserve the right to modify these Terms of Service at any time. Material changes will be communicated via
            email or prominent notice on the platform at least 30 days before taking effect. Changes will be posted on this
            page with an updated "Last updated" date. Your continued use of the Service after any changes constitutes
            acceptance of the new terms. If you disagree with the updated terms, you must stop using the Service.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Governing Law</h2>
          <p className="text-sm text-omn-text">
            These Terms shall be governed by and construed in accordance with the laws of the State of California,
            United States, without regard to its conflict of law provisions. Any legal proceedings not subject to
            arbitration shall be brought exclusively in the state or federal courts located in California.
          </p>
        </div>

        {/* Severability */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Severability</h2>
          <p className="text-sm text-omn-text">
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or
            eliminated to the minimum extent necessary so that the remaining provisions of these Terms remain in full
            force and effect.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-omn-heading mb-4">Contact</h2>
          <div className="text-sm text-omn-text space-y-2">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>General/legal inquiries: <a href="mailto:legal@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">legal@omnid.app</a></span>
              </li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>Privacy/data requests: <a href="mailto:privacy@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">privacy@omnid.app</a></span>
              </li>
              <li className="flex items-start gap-2"><span className="text-omn-primary mt-0.5">*</span>
                <span>Security/identity theft: <a href="mailto:security@omnid.app" className="text-omn-primary hover:text-omn-primary-light transition-colors">security@omnid.app</a></span>
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
