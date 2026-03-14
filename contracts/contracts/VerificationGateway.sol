// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title VerificationGateway - Kerberos-Style Verification Hub for OmnID
/// @notice External apps never see user data directly. Instead, they submit
///         their requirements to this gateway, and it returns ONLY a yes/no
///         result. No unnecessary data is ever exposed.
///
/// ANALOGY (Kerberos):
/// ┌──────────┐    "Does user meet    ┌────────────────────┐    checks internally    ┌─────────────────┐
/// │ External  │ ──  my requirements? ──▶ VerificationGateway │ ─────────────────────▶ │ IdentityRegistry│
/// │   App     │                       │   (like Kerberos    │                        │ AgeVerifier     │
/// │           │ ◀── yes/no + ticket ──│    KDC)             │ ◀──── results ──────── │ CredentialReg.  │
/// └──────────┘                       └────────────────────┘                        │ ReputationAgg.  │
///                                                                                  └─────────────────┘
///
/// The external app NEVER sees: age, credentials, reputation scores, or any personal data.
/// It only receives: "requirements met: true/false" + a verification ticket ID.
contract VerificationGateway is AccessControl {
    // ──────────────────── Contract References ────────────────────

    address public identityRegistry;
    address public credentialRegistry;
    address public ageVerifier;
    address public reputationAggregator;

    // ──────────────────── Structs ────────────────────

    struct VerificationRequest {
        uint256 id;
        address requester;       // The app asking for verification
        address subject;         // The user being verified
        uint256 minAge;          // 0 = don't check age
        uint256 minReputation;   // 0 = don't check reputation
        bytes32 requiredCredentialType; // bytes32(0) = don't check credentials
        bool requireActiveIdentity;
        bool result;             // The verification result
        uint256 createdAt;
        bool processed;
    }

    // ──────────────────── State ────────────────────

    uint256 public nextRequestId = 1;
    mapping(uint256 => VerificationRequest) public requests;
    mapping(address => uint256[]) public appRequests;    // requests by app
    mapping(address => uint256[]) public userRequests;   // requests about user

    // Registered apps that can make verification requests
    mapping(address => bool) public registeredApps;
    mapping(address => string) public appNames;

    // ──────────────────── Events ────────────────────

    event AppRegistered(address indexed app, string name);

    event VerificationRequested(
        uint256 indexed requestId,
        address indexed requester,
        address indexed subject,
        uint256 timestamp
    );

    event VerificationCompleted(
        uint256 indexed requestId,
        address indexed requester,
        address indexed subject,
        bool result,
        uint256 timestamp
    );

    // ──────────────────── Constructor ────────────────────

    constructor(
        address _identityRegistry,
        address _credentialRegistry,
        address _ageVerifier,
        address _reputationAggregator
    ) {
        identityRegistry = _identityRegistry;
        credentialRegistry = _credentialRegistry;
        ageVerifier = _ageVerifier;
        reputationAggregator = _reputationAggregator;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ──────────────────── App Registration ────────────────────

    /// @notice Register an external app that can make verification requests
    function registerApp(
        address app,
        string calldata name
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        registeredApps[app] = true;
        appNames[app] = name;
        emit AppRegistered(app, name);
    }

    // ──────────────────── Core: Submit & Verify ────────────────────

    /// @notice Submit a verification request — the gateway checks everything
    ///         internally and returns ONLY a yes/no result. No data exposed.
    /// @param subject The user to verify
    /// @param minAge Minimum age required (0 to skip age check)
    /// @param minReputation Minimum reputation score required, 0-10000 (0 to skip)
    /// @param requiredCredentialType Required credential type hash (bytes32(0) to skip)
    /// @param requireActiveIdentity Whether an active identity is required
    /// @return requestId The verification request ID (acts as the "ticket")
    /// @return result Whether ALL requirements are met
    function verify(
        address subject,
        uint256 minAge,
        uint256 minReputation,
        bytes32 requiredCredentialType,
        bool requireActiveIdentity
    ) external returns (uint256 requestId, bool result) {
        require(registeredApps[msg.sender], "App not registered");

        requestId = nextRequestId++;
        result = true; // Start optimistic, fail on any check

        // Check 1: Active Identity
        if (requireActiveIdentity) {
            (bool success, bytes memory data) = identityRegistry.staticcall(
                abi.encodeWithSignature("isActiveIdentity(address)", subject)
            );
            if (!success || !abi.decode(data, (bool))) {
                result = false;
            }
        }

        // Check 2: Age Verification
        if (result && minAge > 0) {
            (bool success, bytes memory data) = ageVerifier.staticcall(
                abi.encodeWithSignature(
                    "verifyAge(address,uint256)",
                    subject,
                    minAge
                )
            );
            if (!success || !abi.decode(data, (bool))) {
                result = false;
            }
        }

        // Check 3: Reputation Score
        if (result && minReputation > 0) {
            (bool success, bytes memory data) = reputationAggregator.staticcall(
                abi.encodeWithSignature(
                    "getCompositeReputation(address)",
                    subject
                )
            );
            if (success) {
                // Decode the CompositeReputation struct (weightedScore, sourceCount, calculatedAt)
                (uint256 weightedScore, , ) = abi.decode(
                    data,
                    (uint256, uint256, uint256)
                );
                if (weightedScore < minReputation) {
                    result = false;
                }
            } else {
                result = false;
            }
        }

        // Check 4: Required Credential
        if (result && requiredCredentialType != bytes32(0)) {
            result = _hasValidCredential(subject, requiredCredentialType);
        }

        // Store the request as a verification "ticket"
        requests[requestId] = VerificationRequest({
            id: requestId,
            requester: msg.sender,
            subject: subject,
            minAge: minAge,
            minReputation: minReputation,
            requiredCredentialType: requiredCredentialType,
            requireActiveIdentity: requireActiveIdentity,
            result: result,
            createdAt: block.timestamp,
            processed: true
        });

        appRequests[msg.sender].push(requestId);
        userRequests[subject].push(requestId);

        emit VerificationRequested(requestId, msg.sender, subject, block.timestamp);
        emit VerificationCompleted(requestId, msg.sender, subject, result, block.timestamp);
    }

    // ──────────────────── Internal Helpers ────────────────────

    /// @dev Check if user has at least one valid credential of a given type
    function _hasValidCredential(
        address holder,
        bytes32 credentialType
    ) internal view returns (bool) {
        // Get holder's credential IDs
        (bool success, bytes memory data) = credentialRegistry.staticcall(
            abi.encodeWithSignature(
                "getCredentialsByHolder(address)",
                holder
            )
        );
        if (!success) return false;

        uint256[] memory credIds = abi.decode(data, (uint256[]));

        for (uint256 i = 0; i < credIds.length; i++) {
            // Get the credential — decode as raw tuple matching the Credential struct
            (bool s, bytes memory d) = credentialRegistry.staticcall(
                abi.encodeWithSignature(
                    "getCredential(uint256)",
                    credIds[i]
                )
            );
            if (!s) continue;

            // Credential struct: (id, issuer, holder, credentialType, dataHash, issuedAt, expiresAt, status)
            (
                ,            // id
                address issuer,
                ,            // holder
                bytes32 cType,
                ,            // dataHash
                ,            // issuedAt
                uint256 expiresAt,
                uint8 status
            ) = abi.decode(d, (uint256, address, address, bytes32, bytes32, uint256, uint256, uint8));

            // Check type matches
            if (cType != credentialType) continue;

            // Check status is Active (0)
            if (status != 0) continue;

            // Check not expired (0 means no expiry)
            if (expiresAt != 0 && expiresAt <= block.timestamp) continue;

            // Check issuer is still approved
            (bool s2, bytes memory d2) = credentialRegistry.staticcall(
                abi.encodeWithSignature("isApprovedIssuer(address)", issuer)
            );
            if (!s2) continue;
            bool approved = abi.decode(d2, (bool));
            if (!approved) continue;

            return true;
        }
        return false;
    }

    // ──────────────────── View Functions ────────────────────

    /// @notice Look up a verification ticket (apps can re-check a past result)
    function getVerification(
        uint256 requestId
    ) external view returns (VerificationRequest memory) {
        require(requests[requestId].processed, "Request not found");
        return requests[requestId];
    }

    /// @notice Quick check: is a specific verification ticket valid?
    function isVerified(uint256 requestId) external view returns (bool) {
        return requests[requestId].processed && requests[requestId].result;
    }

    /// @notice Get all verification requests made by an app
    function getAppRequests(
        address app
    ) external view returns (uint256[] memory) {
        return appRequests[app];
    }

    /// @notice Get all verification requests about a user
    function getUserRequests(
        address user
    ) external view returns (uint256[] memory) {
        return userRequests[user];
    }

    /// @notice Get total number of verifications processed
    function getRequestCount() external view returns (uint256) {
        return nextRequestId - 1;
    }
}
