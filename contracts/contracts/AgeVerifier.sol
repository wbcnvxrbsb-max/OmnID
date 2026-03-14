// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title AgeVerifier - Privacy-Preserving Age Verification for OmnID
/// @notice Verifies and stores a user's age without revealing their birthday or SSN.
///
/// HOW IT WORKS:
/// 1. User enters SSN into the frontend (browser only — NEVER touches blockchain)
/// 2. Frontend validates SSN against a sandbox database and derives the user's age
/// 3. User commits hash(birthdate || salt) on-chain — the birthdate stays private
/// 4. A trusted verifier confirms the age off-chain and stores ONLY the verified
///    age on-chain (e.g., age = 12). No SSN, no birthday, no personal info.
/// 5. Any app can call verifyAge(user, 13) to check if age >= 13, or call
///    getVerifiedAge(user) to read the exact verified age.
///
/// WHAT'S ON-CHAIN: verified age (a single number), commitment hash, verifier address
/// WHAT'S NOT ON-CHAIN: SSN, birthday, name, or any other personal data
///
/// PRODUCTION UPGRADE PATH:
/// Replace the trusted verifier with a ZK-SNARK verifier (Groth16 via circom/snarkjs)
/// that mathematically proves age without any trusted party. The interface stays the same.
contract AgeVerifier is AccessControl {
    // ──────────────────── Roles ────────────────────

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // ──────────────────── External Contracts ────────────────────

    address public identityRegistry;

    // ──────────────────── Structs ────────────────────

    struct AgeCommitment {
        bytes32 commitmentHash; // keccak256(abi.encodePacked(birthdate, salt))
        bool committed;
        uint256 committedAt;
    }

    struct VerifiedAge {
        uint256 age;            // The verified age (e.g., 12, 25, 42)
        address verifiedBy;     // Which trusted verifier attested this
        uint256 verifiedAt;     // When the verification happened
        bool isVerified;        // Whether age has been verified at all
    }

    // ──────────────────── State ────────────────────

    mapping(address => AgeCommitment) public commitments;
    mapping(address => VerifiedAge) public verifiedAges;

    // ──────────────────── Events ────────────────────

    event AgeCommitted(
        address indexed user,
        bytes32 commitmentHash,
        uint256 timestamp
    );

    event AgeStored(
        address indexed user,
        uint256 age,
        address indexed verifier,
        uint256 timestamp
    );

    // ──────────────────── Constructor ────────────────────

    constructor(address _identityRegistry) {
        identityRegistry = _identityRegistry;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ──────────────────── Modifiers ────────────────────

    modifier requiresIdentity(address user) {
        (bool success, bytes memory data) = identityRegistry.staticcall(
            abi.encodeWithSignature("isActiveIdentity(address)", user)
        );
        require(success && abi.decode(data, (bool)), "No active identity");
        _;
    }

    // ──────────────────── Functions ────────────────────

    /// @notice Commit a hash of your birthdate + secret salt
    /// @dev The user computes keccak256(abi.encodePacked(birthdate, salt))
    ///      OFF-CHAIN in the browser. The birthdate and SSN never touch
    ///      the blockchain. Only the hash goes on-chain.
    /// @param commitmentHash The hash of (birthdate || salt)
    function commitAge(
        bytes32 commitmentHash
    ) external requiresIdentity(msg.sender) {
        require(commitmentHash != bytes32(0), "Invalid commitment");

        commitments[msg.sender] = AgeCommitment({
            commitmentHash: commitmentHash,
            committed: true,
            committedAt: block.timestamp
        });

        emit AgeCommitted(msg.sender, commitmentHash, block.timestamp);
    }

    /// @notice A trusted verifier stores the user's verified age
    /// @dev The verifier checks the user's birthdate off-chain (via SSN database)
    ///      and submits only the age. In production, this would be a ZK proof.
    /// @param user The address being verified
    /// @param age The user's verified age
    function submitVerification(
        address user,
        uint256 age
    ) external onlyRole(VERIFIER_ROLE) {
        require(commitments[user].committed, "No age commitment found");
        require(age > 0 && age < 150, "Invalid age");

        verifiedAges[user] = VerifiedAge({
            age: age,
            verifiedBy: msg.sender,
            verifiedAt: block.timestamp,
            isVerified: true
        });

        emit AgeStored(user, age, msg.sender, block.timestamp);
    }

    /// @notice Add a trusted verifier (admin only)
    function addTrustedVerifier(
        address verifier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, verifier);
    }

    /// @notice Remove a trusted verifier (admin only)
    function removeTrustedVerifier(
        address verifier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, verifier);
    }

    // ──────────────────── View Functions ────────────────────

    /// @notice Check if a user's verified age is >= a minimum threshold
    /// @param user The address to check
    /// @param minAge The minimum age to check against (e.g., 13, 18, 21)
    /// @return True if the user's verified age is >= minAge
    function verifyAge(
        address user,
        uint256 minAge
    ) external view returns (bool) {
        VerifiedAge memory va = verifiedAges[user];
        return va.isVerified && va.age >= minAge;
    }

    /// @notice Get the exact verified age for a user
    /// @param user The address to query
    /// @return age The verified age (0 if not verified)
    function getVerifiedAge(address user) external view returns (uint256 age) {
        return verifiedAges[user].age;
    }

    /// @notice Get full verification details for a user
    function getVerificationDetails(
        address user
    ) external view returns (VerifiedAge memory) {
        return verifiedAges[user];
    }

    /// @notice Get the age commitment for a user
    function getCommitment(
        address user
    ) external view returns (AgeCommitment memory) {
        return commitments[user];
    }

    /// @notice Check if an address is a trusted verifier
    function isTrustedVerifier(address addr) external view returns (bool) {
        return hasRole(VERIFIER_ROLE, addr);
    }

    /// @notice Check if user has committed their age
    function hasCommitted(address user) external view returns (bool) {
        return commitments[user].committed;
    }

    /// @notice Check if user's age is verified
    function isAgeVerified(address user) external view returns (bool) {
        return verifiedAges[user].isVerified;
    }
}
